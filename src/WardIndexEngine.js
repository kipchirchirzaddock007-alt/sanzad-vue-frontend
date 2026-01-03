// src/wardIndexEngine.js

// ---- CONFIG ----
const WINDOW_DAYS = 90; // lookback window for reports

// ---- HELPERS ----
function normalize0to100(value, minVal, maxVal) {
  if (value === null || value === undefined) return 0;
  if (maxVal === minVal) return 50;
  return ((value - minVal) / (maxVal - minVal)) * 100;
}

function scopeToImpactPct(scope) {
  if (scope === 'individual') return 0.5;
  if (scope === 'street') return 5;
  if (scope === 'village') return 20;
  if (scope === 'whole_ward') return 80;
  return 1;
}

function citizenValidationScore(upvotes, confirmations) {
  const up = Math.min(upvotes || 0, 200);
  const conf = Math.min(confirmations || 0, 200);
  const score = up * 0.3 + conf * 0.7; // 0–200
  return Math.min(score / 2, 100); // -> 0–100
}

function verificationWeight(status) {
  if (status === 'verified_true') return 1.0;
  if (status === 'pending_review') return 0.7;
  if (status === 'unverified') return 0.4;
  if (status === 'verified_false') return -1.0;
  return 0.4;
}

// ---- CORE ENGINE ----

// reports: array of Report for a single ward+category in window
function computeCategoryMetricsForWardCategory(reports, wardPopulation, now) {
  if (!reports || !reports.length) return null;

  let totalWeightedSeverity = 0;
  let totalWeight = 0;
  let totalReports = 0;
  let totalPopulationImpact = 0;
  let totalValScore = 0;
  let maxUnresolvedDays = 0;

  for (const r of reports) {
    const w = verificationWeight(r.verification_status);
    if (w <= 0) continue;

    totalReports += 1;
    totalWeightedSeverity += (r.severity || 0) * w;
    totalWeight += w;

    const impactPct = scopeToImpactPct(r.impact_scope);
    totalPopulationImpact += impactPct;

    const valScore = citizenValidationScore(r.upvotes, r.confirmations);
    totalValScore += valScore;

    const start = new Date(r.timestamp);
    const end = r.resolved_at ? new Date(r.resolved_at) : now;
    const daysUnresolved = Math.max(
      0,
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUnresolved > maxUnresolvedDays) maxUnresolvedDays = daysUnresolved;
  }

  if (totalWeight === 0) return null;

  const severityAvgRaw = totalWeightedSeverity / totalWeight;
  const freqRaw =
    (totalReports / Math.max(wardPopulation || 1, 1)) * 1000;
  const popImpactRaw = Math.min(totalPopulationImpact, 100);
  const citizenValidationRaw = totalValScore / Math.max(totalReports, 1);

  return {
    severity_avg_raw: severityAvgRaw,
    freq_raw: freqRaw,
    pop_impact_raw: popImpactRaw,
    time_unresolved_raw: maxUnresolvedDays,
    citizen_validation_raw: citizenValidationRaw
  };
}

// allMetrics: array of { ward_id, category_id, metrics }
function normalizeMetrics(allMetrics) {
  if (!allMetrics.length) return;

  let minSev = Infinity,
    maxSev = -Infinity;
  let minFreq = Infinity,
    maxFreq = -Infinity;
  let minPop = Infinity,
    maxPop = -Infinity;
  let minTime = Infinity,
    maxTime = -Infinity;
  let minVal = Infinity,
    maxVal = -Infinity;

  for (const m of allMetrics) {
    const x = m.metrics;
    minSev = Math.min(minSev, x.severity_avg_raw);
    maxSev = Math.max(maxSev, x.severity_avg_raw);
    minFreq = Math.min(minFreq, x.freq_raw);
    maxFreq = Math.max(maxFreq, x.freq_raw);
    minPop = Math.min(minPop, x.pop_impact_raw);
    maxPop = Math.max(maxPop, x.pop_impact_raw);
    minTime = Math.min(minTime, x.time_unresolved_raw);
    maxTime = Math.max(maxTime, x.time_unresolved_raw);
    minVal = Math.min(minVal, x.citizen_validation_raw);
    maxVal = Math.max(maxVal, x.citizen_validation_raw);
  }

  for (const m of allMetrics) {
    const x = m.metrics;
    x.severity_avg = normalize0to100(x.severity_avg_raw, minSev, maxSev);
    x.report_frequency_per_1000 = normalize0to100(
      x.freq_raw,
      minFreq,
      maxFreq
    );
    x.population_impact_pct = normalize0to100(
      x.pop_impact_raw,
      minPop,
      maxPop
    );
    x.time_unresolved_days = normalize0to100(
      x.time_unresolved_raw,
      minTime,
      maxTime
    );
    x.citizen_validation_score = normalize0to100(
      x.citizen_validation_raw,
      minVal,
      maxVal
    );
  }
}

function computeNeedScore(metrics, category) {
  const S = metrics.severity_avg;
  const F = metrics.report_frequency_per_1000;
  const P = metrics.population_impact_pct;
  const T = metrics.time_unresolved_days;
  const C = metrics.citizen_validation_score;

  const base =
    S * 0.35 + F * 0.25 + P * 0.2 + T * 0.1 + C * 0.1;

  const needRaw =
    base * (category.category_weight || 1) * (category.urgency_factor || 1);

  metrics.need_score_raw = needRaw;
  metrics.need_score_norm_0_100 = Math.min(needRaw, 100);
}

function assignFlag(maxCatScore, categoryMetricsMap, categoriesById) {
  let criticalOver90 = false;

  for (const [catId, m] of Object.entries(categoryMetricsMap)) {
    if (!m) continue;
    const cat = categoriesById[catId];
    if (!cat) continue;
    if (m.need_score_norm_0_100 > 85 && cat.is_critical) {
      criticalOver90 = true;
    }
  }

  if (criticalOver90) return 'emergency';
  if (maxCatScore > 85) return 'high_priority';
  if (maxCatScore > 60) return 'monitor';
  return 'stable';
}

function computeWardIndexes(wardId, categoryMetricsMap, categoriesById) {
  const infra = [];
  const social = [];
  const safetyEnv = [];
  let maxCatScore = 0;

  for (const [catId, m] of Object.entries(categoryMetricsMap)) {
    if (!m) continue;
    const cat = categoriesById[catId];
    if (!cat) continue;
    const score = m.need_score_norm_0_100 || 0;
    if (cat.is_infrastructure) infra.push(score);
    if (cat.is_social) social.push(score);
    if (cat.is_safety_environment) safetyEnv.push(score);
    if (score > maxCatScore) maxCatScore = score;
  }

  const avg = (arr) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const INI = avg(infra);
  const SSI = avg(social);
  const SEI = avg(safetyEnv);
  const WPI = INI * 0.4 + SSI * 0.35 + SEI * 0.25;

  const flag = assignFlag(maxCatScore, categoryMetricsMap, categoriesById);

  return { ward_id: wardId, INI, SSI, SEI, WPI, flag, max_category_score: maxCatScore };
}

function computeRankings(wardIndexes, wardsById) {
  const list = wardIndexes.map((wi) => {
    const w = wardsById[wi.ward_id] || {};
    return {
      ward_id: wi.ward_id,
      county: w.county || '',
      constituency: w.constituency || '',
      WPI: wi.WPI,
      population: w.population || 0
    };
  });

  // national
  list.sort((a, b) => {
    if (b.WPI !== a.WPI) return b.WPI - a.WPI;
    return (b.population || 0) - (a.population || 0);
  });
  list.forEach((item, idx) => {
    item.national_rank = idx + 1;
  });

  // county
  const byCounty = {};
  for (const item of list) {
    byCounty[item.county] = byCounty[item.county] || [];
    byCounty[item.county].push(item);
  }
  for (const county of Object.keys(byCounty)) {
    const arr = byCounty[county];
    arr.sort((a, b) => {
      if (b.WPI !== a.WPI) return b.WPI - a.WPI;
      return (b.population || 0) - (a.population || 0);
    });
    arr.forEach((item, idx) => {
      item.county_rank = idx + 1;
    });
  }

  // constituency
  const byConst = {};
  for (const item of list) {
    const key = `${item.county}::${item.constituency}`;
    byConst[key] = byConst[key] || [];
    byConst[key].push(item);
  }
  for (const key of Object.keys(byConst)) {
    const arr = byConst[key];
    arr.sort((a, b) => {
      if (b.WPI !== a.WPI) return b.WPI - a.WPI;
      return (b.population || 0) - (a.population || 0);
    });
    arr.forEach((item, idx) => {
      item.constituency_rank = idx + 1;
    });
  }

  return list;
}

// ---- PUBLIC ENTRYPOINT ----

// wards: Ward[]
// categories: Category[]
// reports: Report[] in last WINDOW_DAYS
function buildWardIndexEngineOutput(wards, categories, reports, now = new Date()) {
  const wardsById = {};
  wards.forEach((w) => (wardsById[w.ward_id] = w));

  const categoriesById = {};
  categories.forEach((c) => (categoriesById[c.category_id] = c));

  // group reports by (ward_id, category_id)
  const reportsByWardCat = {};
  const msWindow = WINDOW_DAYS * 24 * 60 * 60 * 1000;
  for (const r of reports) {
    const ts = new Date(r.timestamp).getTime();
    if (now.getTime() - ts > msWindow) continue; // outside window

    const key = `${r.ward_id}::${r.category_id}`;
    if (!reportsByWardCat[key]) reportsByWardCat[key] = [];
    reportsByWardCat[key].push(r);
  }

  // compute metrics per ward/category
  const allMetrics = []; // for global normalization
  const metricsByWard = {}; // ward_id -> { category_id -> metrics }

  for (const key of Object.keys(reportsByWardCat)) {
    const [wardId, catId] = key.split('::');
    const ward = wardsById[wardId];
    if (!ward) continue;

    const metrics = computeCategoryMetricsForWardCategory(
      reportsByWardCat[key],
      ward.population,
      now
    );
    if (!metrics) continue;

    allMetrics.push({ ward_id: wardId, category_id: catId, metrics });
    metricsByWard[wardId] = metricsByWard[wardId] || {};
    metricsByWard[wardId][catId] = metrics;
  }

  // normalize
  normalizeMetrics(allMetrics);

  // compute need scores
  allMetrics.forEach((m) => {
    const cat = categoriesById[m.category_id];
    if (cat) computeNeedScore(m.metrics, cat);
  });

  // recombine metricsByWard with need scores already attached
  const wardIndexes = [];
  for (const wardId of Object.keys(metricsByWard)) {
    const catMetricsMap = metricsByWard[wardId];
    const wi = computeWardIndexes(wardId, catMetricsMap, categoriesById);
    wardIndexes.push(wi);
  }

  const rankings = computeRankings(wardIndexes, wardsById);

  return {
    categoryMetricsByWard: metricsByWard,
    wardIndexes,
    rankings
  };
}

module.exports = {
  buildWardIndexEngineOutput
};
