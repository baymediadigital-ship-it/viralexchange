// Guides: long-form versions of our Thread Library threads, written for search.
// Keep them faithful to what we actually say and do. Never add statistics,
// deal numbers or market claims we can't stand behind; worked examples are
// labelled as examples.

export type GuideBlock = { h?: string; p?: string[]; list?: string[]; after?: string[] };

export type Guide = {
  slug: string;
  title: string; // the H1
  metaTitle: string; // <title>, before "| ViralExchange"
  description: string;
  audience: "sellers" | "buyers";
  published: string; // ISO date
  updated: string;
  intro: string;
  blocks: GuideBlock[];
  related: string[];
};

const D = "2026-11-27";

export const GUIDES: Guide[] = [
  {
    slug: "how-to-sell-a-youtube-channel",
    title: "How to sell your YouTube channel",
    metaTitle: "How to Sell a YouTube Channel: A Step-by-Step Guide",
    description:
      "How to sell a monetized YouTube channel safely: what buyers look for, how pricing works, the questions to ask before you list, and how the deal closes through escrow.",
    audience: "sellers",
    published: D,
    updated: D,
    intro:
      "Your channel has real value. If it makes money every month, it's a business, and businesses have a price. Here's everything to know before you list it.",
    blocks: [
      {
        h: "What your channel is worth",
        p: [
          "Monetized channels sell for a multiple of their monthly profit. Where yours lands depends on its niche, its trend and its risk. Two channels with the same income can sell for very different prices.",
          "Start with a valuation so you know the range before you talk to anyone.",
        ],
      },
      {
        h: "What buyers look for",
        list: ["6+ months of monetization", "Steady or growing revenue", "A clear niche", "No strikes or policy issues"],
      },
      {
        h: "How selling works with us",
        list: [
          "Submit your channel. It's free.",
          "We verify it, usually within 24 hours.",
          "It goes to verified buyers.",
          "The deal closes through escrow.",
        ],
        after: ["No upfront fees. Your channel details stay private until the deal stage."],
      },
      {
        h: "Questions to ask before you list anywhere",
        p: [
          "What are the fees, and when are they charged? Upfront listing fees are a red flag. You should pay when you sell, not before.",
          "Who sees my channel details? Your channel name and numbers shouldn't be public. Competitors and copycats watch these sites.",
          "Is the deal protected? If they don't use escrow, keep looking.",
          "Do they verify buyers? Time-wasters and scammers are common. You want serious buyers only.",
        ],
      },
      {
        h: "Disclose everything early",
        p: [
          "Deals fall apart when due diligence turns up something the seller didn't mention, like a strike or most of the revenue coming from one video. Had it been raised upfront, the deal could often have closed at a lower price instead of not at all.",
          "Buyers forgive problems. They don't forgive surprises.",
        ],
      },
    ],
    related: ["how-much-is-a-youtube-channel-worth", "what-lowers-youtube-channel-value", "when-to-sell-your-youtube-channel"],
  },
  {
    slug: "how-much-is-a-youtube-channel-worth",
    title: "How much is a YouTube channel worth?",
    metaTitle: "How Much Is a YouTube Channel Worth? How Channels Are Valued",
    description:
      "How YouTube channels are valued: what a multiple of monthly profit means, why subscribers don't set the price, and the four steps we use to value a channel.",
    audience: "sellers",
    published: D,
    updated: D,
    intro:
      "Subscribers don't set the price of a YouTube channel. Profit does, and so does how confident a buyer is that the profit will continue. Here's how it actually works. No magic.",
    blocks: [
      {
        h: "What a multiple means",
        p: [
          "When someone says a channel sold for \"8x\", the multiple is applied to monthly profit.",
          "For example: a channel making $1,000 a month in profit, sold at 8x, goes for $8,000. The same channel at 6x goes for $6,000.",
          "The gap comes down to confidence. Buyers are paying for how sure they are that the income will keep coming.",
        ],
      },
      {
        h: "What pushes the multiple up",
        list: [
          "A long, steady revenue history",
          "A high-paying niche",
          "Evergreen videos that keep getting views",
          "Faceless, so it's easy to hand over",
          "No strikes",
        ],
      },
      {
        h: "What pulls it down",
        list: [
          "One viral video carrying the channel",
          "Revenue dropping month on month",
          "Content built around the creator's face",
          "Policy problems",
        ],
        after: ["The multiple is where a channel's real value gets decided."],
      },
      {
        h: "Why a 50k channel can beat a 500k channel",
        p: [
          "Buyers pay for income, not audience size, and income depends heavily on who's watching and what advertisers will pay to reach them.",
          "Finance, tech, business and software audiences are expensive to reach, so advertisers pay a lot for them. Entertainment, gaming and kids' audiences usually pay far less per view.",
          "So a finance channel with 50k engaged viewers can out-earn a gaming channel with 500k. Buyers price the earnings, which is why we always ask for revenue first, not subscriber count.",
        ],
      },
      {
        h: "How we value a channel",
        list: [
          "Verify monetization. Is the channel in the YouTube Partner Program and in good standing?",
          "Look at trailing revenue. Usually the last 90 days, compared against the months before to see the trend.",
          "Apply a niche multiple. Higher-paying, evergreen niches earn a higher multiple.",
          "Adjust for risk. Strikes, one-video dependence, Shorts-heavy income and declining views all bring it down.",
        ],
        after: ["That's why nobody can give you a real number from a subscriber count or a screenshot. It takes the real data."],
      },
    ],
    related: ["youtube-rpm-explained", "what-lowers-youtube-channel-value", "how-to-sell-a-youtube-channel"],
  },
  {
    slug: "youtube-rpm-explained",
    title: "YouTube RPM explained",
    metaTitle: "YouTube RPM Explained: What It Is and Why It Sets Your Channel's Price",
    description:
      "RPM vs CPM in plain English: what your YouTube RPM is, what moves it up or down, and why buyers ask for it before they make an offer on your channel.",
    audience: "sellers",
    published: D,
    updated: D,
    intro: "If you don't know your RPM, you don't know what your channel is worth. Here's the short version.",
    blocks: [
      {
        h: "CPM vs RPM",
        p: [
          "CPM is what advertisers pay per 1,000 ad impressions.",
          "RPM is what you earn per 1,000 views, after YouTube's share, across all your views. RPM is the number that matters.",
        ],
      },
      {
        h: "What moves your RPM",
        list: [
          "Niche. Finance pays more than gaming.",
          "Geography. Viewers in the US, UK, Canada and Australia pay more.",
          "Video length. Longer videos fit more ads.",
          "Season. Q4 is usually the highest, January the lowest.",
        ],
      },
      {
        h: "Why buyers care",
        p: [
          "Two channels with the same views can earn completely different amounts because of RPM alone.",
          "Buyers know this. It's why they ask for your RPM and your audience geography early.",
        ],
      },
    ],
    related: ["how-much-is-a-youtube-channel-worth", "what-lowers-youtube-channel-value", "how-to-sell-a-youtube-channel"],
  },
  {
    slug: "what-lowers-youtube-channel-value",
    title: "Five things that lower a YouTube channel's value",
    metaTitle: "5 Things That Lower a YouTube Channel's Value (or Make It Unsellable)",
    description:
      "Copyright strikes, reused content, one viral video, Shorts-only income and declining numbers: what each does to your channel's price, and what to fix before you sell.",
    audience: "sellers",
    published: D,
    updated: D,
    intro: "Five things will drop your channel's price, or make it unsellable. Fix them before you sell and you'll get a much better price.",
    blocks: [
      { h: "1. Copyright strikes", p: ["Active strikes put the whole channel at risk. Most buyers walk away."] },
      {
        h: "2. Reused content",
        p: ["If your videos rely on footage you don't own, YouTube can demonetize the channel. Buyers know this."],
      },
      {
        h: "3. One viral video",
        p: ["If most of your revenue comes from a single upload, buyers see a spike, not a business."],
      },
      {
        h: "4. Shorts-only income",
        p: ["Shorts pay a fraction of long-form. A channel earning mostly from Shorts is valued accordingly."],
      },
      {
        h: "5. Declining numbers",
        p: ["Buyers look at the trend, not your best month. Three months of decline is a big discount."],
      },
    ],
    related: ["how-much-is-a-youtube-channel-worth", "when-to-sell-your-youtube-channel", "how-to-sell-a-youtube-channel"],
  },
  {
    slug: "when-to-sell-your-youtube-channel",
    title: "When should you sell your YouTube channel?",
    metaTitle: "When to Sell Your YouTube Channel (and Why Creators Do)",
    description:
      "Why creators sell their YouTube channels, the year-three burnout pattern, and why the best time to sell is while your numbers are still strong.",
    audience: "sellers",
    published: D,
    updated: D,
    intro:
      "People assume selling a YouTube channel means you failed. It doesn't. Every YouTube course teaches you how to grow. Almost none teach you how to exit, and that's where a lot of the money is.",
    blocks: [
      {
        h: "Think like a business owner",
        p: [
          "Founders build, grow, then sell. The sale is often the biggest payday of their career. Creators rarely think this way. They upload, earn monthly, and keep going until they burn out or the channel fades. By then it's worth a fraction of what it was.",
          "You don't have to sell. But you should know what your exit looks like before you need one.",
        ],
      },
      {
        h: "The year-three pattern",
        p: [
          "We see the same pattern over and over. Year one is excitement: everything is new and growth feels possible. Year two, the channel works. Money comes in and uploads are consistent.",
          "Year three, the grind shows. Uploads slip. Ideas feel recycled. A new job, a family or a new project starts taking the time.",
          "Here's the problem: when uploads slow, revenue usually follows, and a channel's price is based on its recent numbers. The creators who do best sell while the numbers are still strong, not after the decline has shown up in their analytics.",
        ],
      },
      {
        h: "Why creators sell",
        list: [
          "Burnout. Creating consistently for two or three years wears people down. Selling lets you cash out at peak value instead of watching the channel fade.",
          "Life changes. New jobs, new businesses, new priorities. A channel that made sense three years ago doesn't always fit now.",
          "Capital. A sale turns months of future income into one lump sum you can use to start something new.",
        ],
        after: ["You built something valuable. Don't just walk away from it."],
      },
    ],
    related: ["how-to-sell-a-youtube-channel", "how-much-is-a-youtube-channel-worth", "what-lowers-youtube-channel-value"],
  },
  {
    slug: "youtube-channel-due-diligence",
    title: "YouTube channel due diligence: what to check before you buy",
    metaTitle: "Buying a YouTube Channel? The Due Diligence Checklist",
    description:
      "What serious buyers check before paying for a YouTube channel: live revenue proof, traffic sources, strike history, the revenue trend and whether it can be handed over cleanly.",
    audience: "buyers",
    published: D,
    updated: D,
    intro: "Buying a YouTube channel? Here's what serious buyers check before they pay a cent.",
    blocks: [
      {
        h: "Revenue proof",
        p: [
          "At least 90 days of earnings, shown live in YouTube Studio or on a screen share. Not a screenshot someone could edit.",
        ],
      },
      { h: "Traffic sources", p: ["Search and suggested traffic tend to last. Traffic from one external spike doesn't."] },
      { h: "Strike and policy history", p: ["Any active strikes, or past monetization problems."] },
      {
        h: "The trend",
        p: ["Is revenue growing, flat or falling? One great month means nothing if the last three are sliding."],
      },
      {
        h: "Transferability",
        p: ["Can the channel be handed over cleanly, and does it depend on the current owner's face or voice?"],
      },
      {
        h: "How we handle it",
        p: ["Every channel we list is verified before a buyer sees it, and every deal closes through escrow."],
      },
    ],
    related: ["spot-a-fake-youtube-channel-listing", "escrow-for-youtube-channel-sales", "after-buying-a-youtube-channel"],
  },
  {
    slug: "spot-a-fake-youtube-channel-listing",
    title: "How to spot a fake YouTube channel listing",
    metaTitle: "How to Spot a Fake YouTube Channel Listing: 4 Red Flags",
    description:
      "Not every YouTube channel for sale is what it claims. The red flags to check before you buy: bought subscribers, revenue that doesn't match traffic, screenshot-only proof and pressure to skip escrow.",
    audience: "buyers",
    published: D,
    updated: D,
    intro: "Not every YouTube channel for sale is what it claims. Watch for these red flags before you buy.",
    blocks: [
      {
        h: "Subscribers that don't match views",
        p: ["200k subscribers but 800 views per video usually means bought subscribers."],
      },
      {
        h: "Revenue that doesn't match traffic",
        p: ["If the views can't realistically produce the income claimed, ask harder questions."],
      },
      {
        h: "Screenshots only",
        p: ["A seller who won't show analytics live, on a screen share, is a seller to walk away from."],
      },
      {
        h: "Pressure to pay fast, outside escrow",
        p: ["Legitimate sellers don't mind a safe process."],
      },
    ],
    related: ["youtube-channel-due-diligence", "escrow-for-youtube-channel-sales", "buy-a-youtube-channel-or-start-one"],
  },
  {
    slug: "escrow-for-youtube-channel-sales",
    title: "Escrow, or don't do the deal",
    metaTitle: "Why Every YouTube Channel Sale Should Use Escrow",
    description:
      "How a YouTube channel transfer works, where deals go wrong, and how escrow protects both the buyer and the seller until the transfer is complete.",
    audience: "buyers",
    published: D,
    updated: D,
    intro: "If you're buying or selling a YouTube channel without escrow, stop. Here's why it matters.",
    blocks: [
      {
        h: "A channel transfer isn't instant",
        p: [
          "The buyer is added as an owner, and full primary ownership can only move over after YouTube's waiting period.",
          "That gap is where deals go wrong. The buyer pays and never gets full control. Or the seller hands over access and never gets paid.",
        ],
      },
      {
        h: "How escrow fixes it",
        p: [
          "The money sits with a neutral third party until the transfer is confirmed complete. Then it's released.",
          "Both sides are protected. Nobody has to trust a stranger on the internet.",
        ],
      },
      { h: "Our rule", p: ["Every ViralExchange deal closes through escrow. No exceptions."] },
    ],
    related: ["youtube-channel-due-diligence", "spot-a-fake-youtube-channel-listing", "how-to-sell-a-youtube-channel"],
  },
  {
    slug: "faceless-youtube-channels",
    title: "Why faceless YouTube channels are easier to buy and sell",
    metaTitle: "Faceless YouTube Channels for Sale: Why Buyers Prefer Them",
    description:
      "Why faceless YouTube channels hand over more cleanly than personality channels, and what that means if you're buying one.",
    audience: "buyers",
    published: D,
    updated: D,
    intro: "If you're buying a YouTube channel, look closely at faceless ones. Here's why.",
    blocks: [
      {
        h: "Personality channels are built on a person",
        p: ["When that person leaves, the audience often leaves too."],
      },
      {
        h: "Faceless channels are built on a format",
        p: ["Voiceover, editing style, topic. None of that depends on who owns it. That means:"],
        list: [
          "The handover is cleaner",
          "You can hire writers, editors and voice artists to keep it going",
          "The audience usually doesn't notice the change",
        ],
        after: ["You're buying a system, not a person. That's why buyers pay more confidently for them."],
      },
    ],
    related: ["buy-a-youtube-channel-or-start-one", "after-buying-a-youtube-channel", "youtube-channel-due-diligence"],
  },
  {
    slug: "buy-a-youtube-channel-or-start-one",
    title: "Should you buy a YouTube channel or start one?",
    metaTitle: "Buy a YouTube Channel or Start One? What Each Budget Gets You",
    description:
      "Why buying an established YouTube channel skips the hardest part of YouTube, and how to think about a $10k, $25k or $50k budget.",
    audience: "buyers",
    published: D,
    updated: D,
    intro:
      "The hardest part of YouTube isn't making videos. It's the first months when nobody watches them. Most new channels never get monetized.",
    blocks: [
      {
        h: "Buying skips the first year",
        p: [
          "Starting from scratch means months of uploads, editing and waiting for the algorithm to notice you. Buying an established channel skips all of that. You start with an audience, a working format, and income from day one.",
          "Your job changes from \"how do I get views\" to \"how do I grow what's already working\". That's a much better problem to have.",
          "It's the same reason people buy existing businesses instead of starting from scratch. You pay for the part that's already been proven.",
        ],
      },
      {
        h: "How to think about your budget",
        list: [
          "$10k: a smaller channel with steady income and room to grow. Expect to be hands-on. You're buying potential as much as profit.",
          "$25k: where you can find an established channel with a proven format and a real revenue history.",
          "$50k: a mature channel in a higher-paying niche. Less upside, more stability. You're mostly buying reliable cash flow.",
        ],
      },
      {
        h: "At every budget, avoid",
        list: ["One-hit channels", "Declining numbers", "Anything with strikes", "Sellers who won't show analytics live"],
      },
    ],
    related: ["youtube-channel-due-diligence", "faceless-youtube-channels", "after-buying-a-youtube-channel"],
  },
  {
    slug: "after-buying-a-youtube-channel",
    title: "Your first 30 days after buying a YouTube channel",
    metaTitle: "Just Bought a YouTube Channel? What to Do in the First 30 Days",
    description:
      "What to do (and not do) in your first month as the new owner of a YouTube channel: keep the format, keep the schedule, study retention, then test one change at a time.",
    audience: "buyers",
    published: D,
    updated: D,
    intro: "You just bought a YouTube channel. The first 30 days decide whether it grows or slides.",
    blocks: [
      {
        h: "Don't change the format",
        p: ["The audience subscribed for what's already there. New owners who reinvent everything usually tank the numbers."],
      },
      {
        h: "Keep the upload schedule",
        p: ["If it posted twice a week, post twice a week. A gap is the fastest way to lose momentum."],
      },
      {
        h: "Study the retention graphs",
        p: ["Find the top five videos and work out why they held attention. That's your playbook."],
      },
      {
        h: "Then change one thing at a time",
        p: ["Thumbnails, titles, length. Test, measure, keep what works."],
      },
    ],
    related: ["faceless-youtube-channels", "buy-a-youtube-channel-or-start-one", "youtube-channel-due-diligence"],
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
