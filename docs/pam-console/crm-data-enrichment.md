# Filling the CRM: data enrichment research

**Written:** 14 October 2026, for Marrs and AJ.
**The question (Marrs):** "Can we tap into any apps like Apollo or LinkedIn where we can gather the data so we can fill it out to get a proper picture of who's in your organisation and who we're actually attacking?"
**Status:** research, nothing built. Prices are what was published or reported in 2026 and must be checked at checkout. This is not legal advice; §6 recommends a short lawyer review before the first outbound campaign.

---

## 1. The short answer

- **Yes for Apollo and tools like it.** They will tell us who works at BDO in L&D, HR, Talent and transformation, with titles, locations, LinkedIn links, work emails and sometimes mobiles. The console can call them directly from the CRM.
- **No for LinkedIn, as a data source.** LinkedIn has no way for us to pull other people's profiles into our own database, its partner program is closed, and it has won in court against companies that scraped it. LinkedIn stays what it is today: the place a person checks and confirms, by hand.
- **The law matters more than the tool.** Buying contact data can bring Polynize under the Privacy Act even though we are small, and emailing people we found this way has rules under the Spam Act. Neither stops us; both shape how we do it.

## 2. What each source gives us

| Source | What it gives | Can the console call it? | Starting price (USD) | Australia | Best for |
|---|---|---|---|---|---|
| **Apollo** | People by company and title, then emails and mobiles; company details | Yes, but only on a plan that includes the API (published as "Custom"; some reports say Organization) | $49 a seat a month; the API plan is about $119 a seat with 3 seats minimum, or a quote | Reviews say weaker outside North America and at senior levels | Cheap first pass: who is at the company |
| **LinkedIn / Sales Navigator** | The truth about who is where | No. No data API, partner program closed, no export, CRM sync only for Salesforce, HubSpot, Dynamics and Oracle | Sales Navigator seats | The best source there is | Checking and confirming people by hand |
| **Clay** | Runs many providers one after another until one finds the email or phone | Yes, on the Growth plan: our console sends it a company, Clay sends the results back | About $446 to $495 a month | As good as the providers it uses | Best results without picking one vendor |
| **People Data Labs** | Person and company records, built for developers | Yes, on every plan | Free 100 a month; about $98 a month for 350 people | Not verified | A simple developer-friendly enrichment |
| **Findymail, Prospeo, Hunter** | Verified work emails | Yes (Hunter's API plan not confirmed) | About $49 a month | Pattern-based, not verified for AU | Finding and checking an email |
| **Lusha** | Emails and mobiles | Yes, from the Pro plan | About $70 a month | Not verified | Mobiles, small volume |
| **Firmable** (Australian) | Australian and NZ contacts and mobiles | API pricing not public | Quote, in AUD | Specialist (their own claim) | Australian mobiles |
| **ZoomInfo, Cognism, Crunchbase** | Enterprise databases | Add-on or custom | About $15k to $22k a year | Reported thinner in AU and APAC | Not for us at this stage |
| **Clearbit** | Now only inside HubSpot | No | Needs HubSpot | n/a | Not usable |
| **ABN Lookup** (government) | Company legal name, ABN, status | Yes, free | Free | Authoritative | Company identity |
| **Our own meetings (Fireflies)** | People we have actually met | Already built into the CRM | Free | Exact | The strongest data we have |

Sources for every figure are in §8.

## 3. What it would look like in the CRM

The obvious shape, which keeps a person in charge of who gets added:

1. **On a company's Contacts tab, a "Find people" button.** You choose roles (L&D, HR, People and Culture, Talent, Digital or AI transformation, Partner or Director) and a region. The console asks the provider and shows a list of names, titles and locations. **Nothing is added and almost nothing is spent yet**, because Apollo's people search is free and returns no contact details.
2. **You tick the people who matter.** Only those are enriched (email, phone, LinkedIn link), which is where the credits go. A shortlist of ten costs ten lookups, not five hundred.
3. **Each contact remembers where it came from** (Apollo, Fireflies, typed by hand, the company website) **and when.** The law in §5 needs us to be able to tell a person where we got their details. It also lets us see which source turns into meetings.
4. **"Fill in company details"** on a company's profile: industry, headcount, regions, website, LinkedIn page, from the provider and ABN Lookup, for you to accept or change.
5. **LinkedIn stays manual.** The contact has a LinkedIn field; whoever checks the person pastes it.

## 4. Recommendation

**Start small and cheap, prove it on five target companies, then decide.**

- **Now, free:** ABN Lookup for company identity; the meeting links and attendee contacts we already pull from Fireflies; each firm's own "our people" and leadership pages, annual reports and conference speaker lists, entered by hand.
- **Pilot, about one month:** **Apollo** for the free people search, plus **one** enrichment provider for the shortlisted people. Use People Data Labs or Findymail if Apollo's API plan cannot be had at a sensible price. Run it on BDO, PwC, EY, KPMG and one partner firm and judge it on one question: did it find the right people in Australia, with emails that did not bounce?
- **If the pilot is thin in Australia:** get a quote from **Firmable**, or move to **Clay** so several providers are tried in turn.
- **Not now:** ZoomInfo, Cognism, Crunchbase (too expensive for the coverage we would get), anything that scrapes LinkedIn.

Building the CRM side (§3) is a few days once a provider is chosen. The provider's key goes into Vercel by you, as with every other key.

## 5. The rules we would be working under

**Privacy Act.** Businesses under A$3m turnover are normally exempt, **but the regulator says buying contact lists counts as "trading in personal information", and a business that does that must follow the Australian Privacy Principles.** So plan as if they apply:
- Collect only what we need for the relationship (APP 3).
- Be able to tell someone we hold their details and where we got them (APP 5). That is why every contact needs its source and date.
- Every marketing message to a bought contact needs a simple way to opt out, and we must tell them our source if they ask (APP 7).

**Spam Act.** For commercial emails: a found work address is not consent. There is a narrow exception for addresses the person or firm has **published** themselves, where the email relates to their role and there is no "no marketing" note beside it. Every email identifies us and has a working unsubscribe, and we have to be able to prove consent if challenged. A one-to-one email from Kristin about a real piece of work is a very different thing from a campaign; the rules bite hardest on campaigns.

**What is coming.** A draft of the next round of Privacy Act changes was released on 31 August 2026. As drafted it would require **consent before trading personal information** and a "fair and reasonable" test aimed at data enrichment. It is not law yet. If it passes as drafted, bought contact data gets harder, and the data we gather ourselves (meetings, introductions, partners) becomes worth more.

**UK and EU contacts** (for global firms): business emails usually rest on "legitimate interest", people can always object, and we must tell them we hold their details.

## 6. The three risks

1. **Privacy Act, despite our size.** Buying contacts can put us under it. The fix is cheap: record the source, offer the opt-out, answer "where did you get my details?".
2. **Spam Act on campaigns.** Bulk email to found addresses at BDO or PwC without consent or an unsubscribe. The fix: keep enrichment for research and one-to-one outreach, and run any campaign past the rules first.
3. **LinkedIn.** Scraping tools, or vendors whose data is scraped from LinkedIn, risk our team's Sales Navigator accounts and leave us holding data we may be made to delete. Proxycurl, a large provider of exactly this, was sued by LinkedIn and closed in July 2025.

**A short privacy lawyer review before the first outbound campaign** is worth the money.

## 7. Decisions for Marrs and AJ

1. Run the Apollo pilot on five companies? (Needs an Apollo plan with API access; a quote from Apollo sales.)
2. Which roles count as "who we are attacking" at a firm? The search filters are only as good as this list.
3. Do we want Sales Navigator seats for the people doing the manual checking?
4. Book the privacy lawyer before or after the pilot?

## 8. Sources

Apollo: [pricing](https://www.apollo.io/pricing), [API key doc](https://docs.apollo.io/docs/create-api-key.md), [API credit costs](https://docs.apollo.io/docs/api-pricing), [plan prices, Docket](https://docket.io/resources/research/apollo-pricing), [seat minimum, Stitchflow](https://www.stitchflow.com/user-management/apollo/api), [APAC review, Leadhaste](https://leadhaste.com/blog/apollo-review-2026), [APAC databases, Bitscale](https://bitscale.ai/blogs/b2b-databases-apac).
LinkedIn: [Sign In scope](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2), [Community Management people search](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-atmention-search-api?view=li-lms-2026-09), [API terms](https://www.linkedin.com/legal/l/api-terms-of-use), [partner program](https://business.linkedin.com/sales-solutions/partners), [Sales Navigator export](https://www.cleverly.co/blog/export-leads-from-linkedin-sales-navigator), [CRM Sync](https://www.linkedin.com/help/linkedin/answer/a104003), [hiQ settlement, Proskauer](https://www.proskauer.com/blog/hiq-and-linkedin-reach-proposed-settlement-in-landmark-scraping-case), [Proxycurl closure](https://nubela.co/blog/goodbye-proxycurl/).
Clay: [pricing](https://www.clay.com/pricing), [credits and actions, Docket](https://www.docket.io/resources/research/clay-pricing).
Others: [ZoomInfo, Databar](https://databar.ai/blog/article/zoominfo-pricing-2026), [ZoomInfo in AU, Firmable](https://firmable.com/au/resources/blog/top-zoominfo-alternatives-for-australia-and-nz-companies-in-2025/), [Cognism, Prospeo](https://prospeo.io/s/what-is-cognism), [Lusha API, Reply](https://reply.io/blog/lusha-api/), [People Data Labs, Cleanlist](https://www.cleanlist.ai/blog/2026-09-01-people-data-labs-pricing-guide), [Clearbit sunset, Abmatic](https://abmatic.ai/blog/clearbit-sunset-what-to-use-instead-2026), [Hunter, MarketBetter](https://marketbetter.ai/blog/hunter-io-pricing-breakdown-2026/), [RocketReach, Prospeo](https://prospeo.io/s/rocketreach-pricing), [Crunchbase API](https://pipeline.zoominfo.com/sales/crunchbase-api), [Coresignal](https://apiserpent.com/blog/coresignal-pricing-explained), [Kaspr](https://www.cleanlist.ai/blog/2026-09-01-kaspr-pricing-guide), [Seamless.AI, Docket](https://www.docket.io/resources/research/seamlessai-pricing), [Findymail, Emelia](https://emelia.io/hub/findymail-pricing), [Prospeo, Emelia](https://emelia.io/hub/prospeo-pricing), [Firmable review](https://syncgtm.com/blog/firmable-review), [ABN Lookup web services](https://abr.business.gov.au/Tools/WebServices).
Law: [OAIC, trading in personal information](https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/organisations/trading-in-personal-information), [OAIC, APP 7](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-7-app-7-direct-marketing), [small business exemption and 2024 changes, Warlows](https://warlowslegal.com.au/is-your-start-up-ready-for-privacy-act-amendments/), [ACMA, avoid sending spam](https://www.acma.gov.au/avoid-sending-spam), [ACMA compliance](https://www.acma.gov.au/spam-compliance-alerts), [published addresses, Mondaq](https://www.mondaq.com/australia/consumer-law/996226/spamming-and-the-spam-act), [tranche 2 draft, Corrs](https://www.corrs.com.au/insights/australias-privacy-act-reforms-fundamental-changes-proposed-in-new-exposure-draft), [UK B2B marketing, ICO](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing/).
