import { isUpcoming } from './events';

const top = (counts, n = 5) =>
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));

// Everything the Explore and Personal screens show, from the user's tickets and ticketing rounds.
export function summarize(events, rounds = []) {
  const artists = {};
  const places = {};
  const years = {};
  const spent = {}; // per currency
  let priced = 0;
  let upcoming = 0;

  for (const e of events) {
    if (isUpcoming(e)) upcoming += 1;
    if (e.artist) artists[e.artist] = (artists[e.artist] || 0) + 1;
    const place = e.city || e.venue;
    if (place) places[place] = (places[place] || 0) + 1;

    const y = (e.date || '').slice(0, 4);
    if (y) {
      years[y] ||= { year: y, count: 0, spent: {} };
      years[y].count += 1;
    }

    const price = Number(e.price);
    if (e.price !== '' && e.price != null && !Number.isNaN(price)) {
      priced += 1;
      spent[e.currency] = (spent[e.currency] || 0) + price;
      if (y) years[y].spent[e.currency] = (years[y].spent[e.currency] || 0) + price;
    }
  }

  const average = {};
  for (const c of Object.keys(spent)) {
    const n = events.filter((e) => e.currency === c && e.price !== '' && e.price != null).length;
    average[c] = spent[c] / n;
  }

  return {
    total: events.length,
    upcoming,
    attended: events.length - upcoming,
    spent,
    average,
    priced,
    artists: top(artists),
    places: top(places),
    years: Object.values(years).sort((a, b) => b.year.localeCompare(a.year)),
    got: rounds.filter((r) => r.result === 'got').length,
    missed: rounds.filter((r) => r.result === 'missed').length,
    prayers: rounds.reduce((sum, r) => sum + (r.prayers || 0), 0),
  };
}
