/** THE COMPANY-FIRST CRM (D120): who can use it, cleaning what the forms send, and the dashboard sums. */
import { canUseCrm, ownerName, cleanValues, refFor, stageProbability, nameFromEmail, FIELDS, CRM_TEAM, DEAL_TYPES } from '../schema';
import { buildDashboard, conversion, dealsWithoutNextStep, isOverdue, quarterOf, weighted, formatMoney, addDays } from '../metrics';

let pass = 0;
let fail = 0;
const ok = (n: string, c: boolean, x = '') => {
  if (c) pass += 1;
  else {
    fail += 1;
    console.log(`FAIL ${n} ${x}`);
  }
};
const eq = (n: string, got: unknown, want: unknown) => ok(n, JSON.stringify(got) === JSON.stringify(want), `got ${JSON.stringify(got)}`);

/* who */
eq('the team is the five Marrs named', CRM_TEAM.map((m) => m.name), ['Marrs', 'Kristin', 'Shourov', 'Logen', 'AJ']);
eq('AJ can use it', canUseCrm('aj@polynize.io'), true);
eq('so can Logen', canUseCrm('logen@polynize.io'), true);
eq('Julian cannot', canUseCrm('julian@polynize.io'), false);
eq('Shourov under his Fireflies address', canUseCrm('Shourov@polynize.com '), true);
eq('nobody signed in cannot', canUseCrm(null), false);
eq('an owner shows by name', ownerName('kristin@polynize.io'), 'Kristin');
eq('no owner says so', ownerName(null), 'Unassigned');

/* partnership is a deal type */
ok('Partnership is a deal type', DEAL_TYPES.some((t) => t.id === 'partnership'));

/* cleaning */
const c1 = cleanValues('deal', { name: ' BDO pilot ', company_id: '11111111-2222-3333-4444-555555555555', value: '$85,000', probability: '140', currency: 'USD', stage: 'proposal', owner: 'AJ@polynize.io', close_date: '2026-11-30', junk: 'x' }, false);
eq('nothing missing', c1.missing, []);
eq('text is trimmed', c1.values.name, 'BDO pilot');
eq('money loses its symbols', c1.values.value, 85000);
eq('probability is capped at 100', c1.values.probability, 100);
eq('an owner is matched to the team address', c1.values.owner, 'aj@polynize.io');
ok('an unknown field is dropped', !('junk' in c1.values));
const c2 = cleanValues('deal', { name: '', stage: 'nonsense', owner: 'stranger@x.com', close_date: '30/11/2026' }, false);
eq('required fields are named', c2.missing, ['Deal name', 'Company']);
eq('an unknown stage is not stored', c2.values.stage, null);
eq('a stranger is not an owner', c2.values.owner, null);
eq('a date in another shape is not stored', c2.values.close_date, null);
const c3 = cleanValues('company', { notes: 'more' }, true);
eq('an edit leaves unsent fields alone', Object.keys(c3.values), ['notes']);
eq('and does not ask for the name', c3.missing, []);
eq('but an edit cannot blank a required field', cleanValues('company', { name: '  ' }, true).missing, ['Company name']);
eq('an empty optional becomes nothing', cleanValues('company', { website: '' }, true).values.website, null);
for (const k of ['company', 'contact', 'deal', 'action'] as const) {
  ok(`${k}: every required field is essential`, FIELDS[k].filter((f) => f.required).every((f) => f.essential));
  ok(`${k}: the create form is short`, FIELDS[k].filter((f) => f.essential).length <= 9);
}

/* small things */
eq('the IDs AJ drew', refFor('company', 1), 'COM-001');
eq('and past a thousand', refFor('action', 1234), 'ACT-1234');
eq('proposal is a coin toss', stageProbability('proposal'), 50);
eq('a name from an address', nameFromEmail('jordan.lee@bdo.com'), { first_name: 'Jordan', last_name: 'Lee' });
eq('or as much as there is', nameFromEmail('jordan@bdo.com'), { first_name: 'Jordan' });
eq('the quarter', quarterOf('2026-10-14'), '2026-Q4');
eq('a week on', addDays('2026-12-29', 7), '2027-01-05');

/* the numbers */
const deal = (id: string, stage: string, value: number, probability: number, currency = 'AUD', close_date?: string) => ({ id, company_id: 'c1', name: id, stage, value, probability, currency, close_date });
eq('weighted is value times probability', weighted(deal('a', 'proposal', 160000, 65)), 104000);
const action = (id: string, status: string, due?: string, deal_id?: string) => ({ id, company_id: 'c1', task: id, status, due, deal_id });
eq('past due and open is overdue', isOverdue(action('x', 'todo', '2026-10-13'), '2026-10-14'), true);
eq('done is never overdue', isOverdue(action('x', 'done', '2026-10-13'), '2026-10-14'), false);
eq('a deal with no open action has no next step', [...dealsWithoutNextStep([deal('a', 'demo', 1, 1), deal('b', 'demo', 1, 1), deal('c', 'won', 1, 1)], [action('t', 'todo', undefined, 'a'), action('u', 'done', undefined, 'b')])], ['b']);

const conv = conversion([
  { deal_id: 'a', stage: 'contacted', at: '2026-09-01' },
  { deal_id: 'a', stage: 'discovery', at: '2026-09-05' },
  { deal_id: 'b', stage: 'contacted', at: '2026-09-01' },
  { deal_id: 'b', stage: 'lost', at: '2026-09-10' },
]);
eq('half of contacted went further', conv[0], { stage: 'contacted', reached: 2, advanced: 1, rate: 50 });
eq('no deal reached proposal, so no rate', conv[3].rate, undefined);

const dash = buildDashboard({
  companies: [
    { id: 'c1', name: 'BDO', status: 'engaged', created_at: '2026-10-01T00:00:00Z' },
    { id: 'c2', name: 'PwC', status: 'target', created_at: '2026-07-01T00:00:00Z' },
  ],
  contacts: [{ id: 'p1', company_id: 'c1', first_name: 'Jordan', created_at: '2026-10-02T00:00:00Z' }],
  deals: [
    deal('a', 'discovery', 320000, 35, 'AUD', '2026-12-15'),
    deal('b', 'demo', 85000, 50, 'USD', '2026-11-20'),
    deal('c', 'won', 40000, 100, 'AUD'),
  ],
  actions: [action('t', 'todo', '2026-10-13', 'a'), action('u', 'todo', '2026-10-18')],
  meetings: [{ id: 'm', company_id: 'c1', title: 'x', url: 'https://x', met_at: '2026-10-02', created_at: '2026-10-02T00:00:00Z' }],
  events: [],
  today: '2026-10-14',
});
eq('two target accounts', dash.targetCompanies, 2);
eq('one engaged', dash.engaged, 1);
eq('two open deals', dash.openDeals, 2);
eq('pipeline kept per currency', dash.openPipeline, { AUD: 320000, USD: 85000 });
eq('weighted per currency', dash.weightedPipeline, { AUD: 112000, USD: 42500 });
eq('both actions due within the week', dash.followUpsDue, 2);
eq('one overdue', dash.overdue, 1);
eq('won counted with its value', dash.won, { count: 1, value: { AUD: 40000 } });
eq('the deal with no next step', dash.noNextStep, 1);
eq('forecast months in order', dash.forecastByMonth.map((m) => m.month), ['2026-11', '2026-12']);
eq('one new company this quarter', dash.newCompaniesThisQuarter, 1);
ok('money reads per currency', /A\$/.test(formatMoney(dash.openPipeline)) && /US\$/.test(formatMoney(dash.openPipeline)));

eq('AJ style, millions', formatMoney({ AUD: 1180000 }), 'A$1.18m');
eq('thousands', formatMoney({ AUD: 492000 }), 'A$492k');
eq('small amounts in full', formatMoney({ USD: 8500 }), 'US$8,500');
eq('largest first, each named', formatMoney({ USD: 85000, AUD: 320000 }), 'A$320k · US$85k');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
