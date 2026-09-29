// Canonical tool data for X Tools Directory.
import adminData from './tool-admin-data.json';
import { CATALOG_CURATION, CATEGORY_JOBS } from './catalog-curation.js';

export const JOBS = {
  write: { label: 'Write posts & threads' },
  schedule: { label: 'Schedule & publish' },
  engage: { label: 'Reply & engage' },
  analytics: { label: 'Analyze performance' },
  bookmarks: { label: 'Organize bookmarks' },
  listen: { label: 'Listen & monitor' },
  clean: { label: 'Clean your account' },
  agents: { label: 'Post from an agent' },
  dms: { label: 'Manage DMs' },
  visuals: { label: 'Create X visuals' }
};

export const NETWORKS = {
  x: 'X',
  linkedin: 'LinkedIn',
  bluesky: 'Bluesky',
  instagram: 'Instagram',
  facebook: 'Facebook',
  threads: 'Threads',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  pinterest: 'Pinterest',
  mastodon: 'Mastodon',
  reddit: 'Reddit'
};

export const X_FIT = {
  high: { label: 'High', description: 'X is the product or the core job.' },
  medium: { label: 'Medium', description: 'Multi-network, with a meaningful first-class X workflow.' },
  low: { label: 'Low', description: 'X is incidental or a limited part of the product.' },
  unknown: { label: 'Not rated', description: 'X fit has not been independently verified yet.' }
};

export const TOOL_STATUS = {
  live: { label: 'Live' },
  degraded: { label: 'Degraded' },
  'dropped-x': { label: 'Dropped X' },
  'shut-down': { label: 'Shut down' }
};

export const API_STATUS = {
  official: { label: 'Official API' },
  'official-plus-other': { label: 'Official API + other data' },
  'no-api': { label: 'No API (extension / local)' },
  unclear: { label: 'Unclear' }
};

export const THREAD_SUPPORT = {
  native: { label: 'Native', description: 'Write, preview, and publish a connected reply chain.' },
  'split-only': { label: 'Split only', description: 'Splits a long draft into X-sized chunks for manual posting.' },
  'queue-only': { label: 'Queue only', description: 'Schedules several standalone posts rather than a connected thread.' },
  none: { label: 'None', description: 'Does not provide a connected-thread composer.' }
};

const STATUS_ORDER = { live: 0, degraded: 1, 'dropped-x': 2, 'shut-down': 3 };
const X_FIT_ORDER = { high: 0, medium: 1, low: 2, unknown: 3 };

export function compareTools(a, b) {
  return (STATUS_ORDER[a.status] ?? 4) - (STATUS_ORDER[b.status] ?? 4)
    || (X_FIT_ORDER[a.xFit] ?? 4) - (X_FIT_ORDER[b.xFit] ?? 4)
    || Number(Boolean(b.editorPick)) - Number(Boolean(a.editorPick))
    || a.name.localeCompare(b.name);
}

export const CATS = {
  content:{label:'Content Writing',color:'#1D9BF0'},
  growth:{label:'Growth & Audience',color:'#00BA7C'},
  schedule:{label:'Scheduling & Automation',color:'#7856FF'},
  analytics:{label:'Analytics',color:'#FF7A00'},
  ai:{label:'AI Reply & Engagement',color:'#F91880'},
  design:{label:'Design & Media',color:'#00A9C0'},
  audit:{label:'Profile Audit',color:'#E8A400'},
  // Slug stays `comments` for stable URLs; label matches what's actually listed (bookmark tools).
  comments:{label:'Bookmarks & Saves',color:'#5B6EF5'},
  bio:{label:'Bio Link Tools',color:'#14B8A6'},
  listening:{label:'Social Listening',color:'#8B5CF6'}
};

export const ICONS = {all:'🗂️',content:'✍️',growth:'📈',schedule:'🗓️',analytics:'📊',ai:'🤖',design:'🎨',audit:'🔍',comments:'🔖',bio:'🔗',listening:'👂'};

export const PRICE_STYLES = {
  Free:{bg:'#E3F7EF',fg:'#00875A'},
  Freemium:{bg:'#E8F3FE',fg:'#1478C4'},
  Paid:{bg:'#F0EDFB',fg:'#5B3FD6'}
};

const TOOL_DATA = [
  {
    id:'typefully',name:'Typefully',cat:'content',price:'Freemium',url:'https://typefully.com',tested:true,editorPick:true,color:'#1D9BF0',addedAt:'2026-07-14',
    tagline:'Write, schedule and analyze X threads in a clean, focused editor.',
    desc:'Typefully is a distraction-free writing studio for X. Draft threads with live preview, get AI hooks and rewrites, schedule at the best times, and track exactly what performs.',
    best:'Solo creators, content teams and agencies who want a calm space to draft and ship.',
    features:['Clean thread composer with live preview','AI hooks, rewrites and ideas','Schedule and auto-retweet','Per-thread engagement analytics']
  },
  {id:'chirrapp',name:'Chirr App',cat:'content',price:'Freemium',url:'https://getchirrapp.com',tested:false,editorPick:false,color:'#F91880',tagline:'Turn long writing into perfectly-split X threads in one click.',desc:'Chirr App auto-splits any long text into a clean numbered thread. Preview each post, adjust the splits, add media and schedule straight to X.',best:'Remote teams and creators repurposing long-form writing into threads.',features:['Auto-split text into tweets','Live thread preview','Numbering and media support','Direct scheduling']},
  {id:'supabird',name:'SupaBird',cat:'content',price:'Freemium',url:'https://supabird.io',tested:false,editorPick:false,color:'#00BA7C',tagline:'An all-in-one writing and scheduling workspace for X creators.',desc:'SupaBird bundles a thread composer, content calendar, AI assistance and analytics into one affordable workspace built for growing on X.',best:'Freelancers and creators worldwide who want an affordable all-in-one.',features:['Thread and post composer','Content calendar','AI writing assistance','Basic analytics']},
  {id:'microposter',name:'MicroPoster',cat:'content',price:'Freemium',url:'https://microposter.so',tested:false,editorPick:false,color:'#FF7A00',tagline:'Batch-write and queue short posts to stay consistent on X.',desc:'MicroPoster helps you draft posts in bulk, organize them into a queue and keep a steady posting cadence without living in the app.',best:'Indie founders and creators building a consistent posting habit.',features:['Bulk post drafting','Simple posting queue','Best-time scheduling','Draft library']},
  {id:'geniusx',name:'GeniusX',cat:'growth',price:'Paid',url:'https://www.blockmm.ai/services/genius-follow',tested:false,editorPick:false,color:'#7856FF',tagline:'Find and target the niche followers most likely to engage.',desc:'GeniusX analyzes accounts and audiences to surface the niche followers worth targeting, so you grow with the right people instead of vanity numbers.',best:'Accounts targeting niche followers for higher-quality growth.',features:['Niche audience targeting','Follower quality scoring','Engagement prediction','Growth campaign tools']},
  {id:'clonex',name:'CloneX',cat:'growth',price:'Paid',url:'https://www.blockmm.ai/services/clonex-follow',tested:false,editorPick:false,color:'#F91880',tagline:'Capture a competitor’s audience and turn it into your own.',desc:'CloneX maps the followers of any competitor account and helps you engage and convert that audience, replicating what already works in your niche.',best:'Teams running competitor audience-capture strategies.',features:['Competitor audience mapping','Follower overlap analysis','Targeted engagement lists','Conversion tracking']},
  {id:'phantombuster',name:'PhantomBuster',cat:'growth',price:'Paid',url:'https://phantombuster.com',tested:true,editorPick:false,color:'#0F1419',tagline:'Automate lead-gen and data extraction across X and the web.',desc:'PhantomBuster runs no-code automations that extract profiles, scrape audiences and drive outreach at scale — a staple for B2B growth teams.',best:'B2B operators and lead-gen teams automating outreach.',features:['No-code automation "phantoms"','Audience and profile scraping','Automated outreach flows','CRM and export integrations']},
  {id:'socialdog',name:'SocialDog',cat:'growth',price:'Freemium',url:'https://social-dog.net',tested:true,editorPick:false,color:'#00BA7C',tagline:'Grow and manage your X account with follow tools and analytics.',desc:'SocialDog combines follower management, keyword monitoring, scheduling and analytics to help businesses grow and maintain a healthy X presence.',best:'Businesses and marketing teams managing account growth.',features:['Follower management tools','Keyword monitoring','Scheduling and queues','Growth analytics']},
  {id:'circleboom',name:'Circleboom',cat:'growth',price:'Freemium',url:'https://circleboom.com',tested:true,editorPick:false,color:'#1D9BF0',tagline:'Schedule posts and clean up your X account in one dashboard.',desc:'Circleboom pairs a full scheduler with account-hygiene tools — unfollow inactive accounts, bulk-delete old tweets and manage multiple profiles.',best:'Users cleaning up spam and inactive accounts while scheduling.',features:['Post scheduling and queues','Bulk-delete old tweets','Find inactive follows','Multi-account management']},
  {id:'audiense',name:'Audiense',cat:'growth',price:'Paid',url:'https://audiense.com',tested:false,editorPick:false,color:'#FF7A00',tagline:'Audience intelligence and segmentation for X marketers.',desc:'Audiense builds rich audience segments from X data — interests, influencers and personas — so brands understand exactly who follows them and why.',best:'Marketers, researchers and agencies doing audience research.',features:['AI audience segmentation','Persona and interest reports','Influencer identification','Competitor audience insight']},
  {id:'followerwonk',name:'Followerwonk',cat:'growth',price:'Paid',url:'https://followerwonk.com',tested:false,editorPick:false,color:'#7856FF',tagline:'Analyze followers, find influencers and compare accounts.',desc:'Followerwonk digs into follower demographics, active times and account comparisons to help you build target lists and find opportunity.',best:'Teams doing target-list building and audience research.',features:['Follower demographic breakdowns','Active-time analysis','Account comparison','Influencer discovery']},
  {id:'catchintent',name:'CatchIntent',cat:'growth',price:'Paid',url:'https://catchintent.com',tested:false,editorPick:false,color:'#00BA7C',tagline:'Spot high-intent prospects on X before your competitors do.',desc:'CatchIntent monitors conversations for buying signals and surfaces the prospects worth reaching out to, turning X activity into a pipeline.',best:'B2B teams, founders and marketers hunting high-intent leads.',features:['Buying-intent detection','Prospect surfacing','Keyword and topic tracking','Outreach lists']},
  {id:'buffer',name:'Buffer',cat:'schedule',price:'Freemium',url:'https://buffer.com',tested:true,editorPick:false,color:'#0F1419',tagline:'Simple, reliable scheduling across X and every other channel.',desc:'Buffer is a long-trusted scheduler — plan a queue, collaborate with a team and publish to X alongside other platforms from one clean calendar.',best:'Solo users and small marketing teams scheduling across channels.',features:['Cross-platform calendar','Team roles and approvals','Clean, no-clutter analytics','Free plan for solo users']},
  {id:'hootsuite',name:'Hootsuite',cat:'schedule',price:'Paid',url:'https://hootsuite.com',tested:true,editorPick:false,color:'#0F1419',tagline:'Enterprise-grade social management, scheduling and monitoring.',desc:'Hootsuite offers scheduling, a unified inbox, monitoring streams and reporting built for teams managing X and many other channels at scale.',best:'Small-to-medium teams and enterprises managing many channels.',features:['Bulk scheduling','Monitoring streams','Unified inbox','Team reporting']},
  {id:'tweethunter',name:'Tweet Hunter',cat:'schedule',price:'Paid',url:'https://tweethunter.io',tested:true,editorPick:false,color:'#1D9BF0',tagline:'Viral-tweet library, AI writer and scheduler to grow on X.',desc:'Tweet Hunter combines a searchable library of viral posts, AI writing, scheduling and a lightweight CRM so you can grow and monetize your audience.',best:'Creators and power users scaling their X output.',features:['Searchable viral-tweet library','AI writing tools','Scheduling and auto-DMs','Audience CRM']},
  {id:'hypefury',name:'Hypefury',cat:'schedule',price:'Paid',url:'https://hypefury.com',tested:true,editorPick:true,color:'#7856FF',tagline:'Automate growth — schedule, recycle evergreen posts and auto-DM.',desc:'Hypefury queues content, recycles your best posts, auto-plugs threads once they take off, and turns engagement into subscribers and sales.',best:'Solo creators, SaaS founders and agencies automating growth.',features:['Evergreen post recycling','Auto-retweet and auto-plug','Inspiration feed of proven posts','Sell products via auto-DM']},
  {id:'opentweet',name:'OpenTweet',cat:'schedule',price:'Paid',url:'https://opentweet.io',tested:false,editorPick:false,color:'#00A9C0',tagline:'A developer-friendly scheduler and API for automating X posts.',desc:'OpenTweet gives indie hackers and developers a clean scheduler plus an API to automate posting, threads and content workflows programmatically.',best:'Indie hackers, developers and SaaS founders automating posts.',features:['Post and thread scheduling','Developer API access','Automation workflows','Multi-account support']},
  {id:'fedica',name:'Fedica',cat:'schedule',price:'Freemium',url:'https://fedica.com',tested:false,editorPick:false,color:'#7856FF',tagline:'Analytics, publishing and audience insights in one suite.',desc:'Fedica offers deep analytics, smart scheduling based on when your audience is active, and audience segmentation for data-minded managers.',best:'Nonprofits, global brands and marketing teams.',features:['Predictive best-time posting','Audience interest segments','Historical tweet analytics','Publishing calendar']},
  {id:'sproutsocial',name:'Sprout Social',cat:'analytics',price:'Paid',url:'https://sproutsocial.com',tested:true,editorPick:true,color:'#7856FF',tagline:'Enterprise analytics, publishing and social listening for X.',desc:'Sprout Social delivers rich reporting, a smart inbox, publishing and listening in a polished platform built for larger teams and agencies.',best:'Mid-to-large teams, agencies and enterprises.',features:['Advanced reporting','Smart social inbox','Listening and trends','Team workflows']},
  {id:'brandwatch',name:'Brandwatch',cat:'analytics',price:'Paid',url:'https://brandwatch.com',tested:true,editorPick:false,color:'#F91880',tagline:'Consumer intelligence and social listening at enterprise scale.',desc:'Brandwatch tracks millions of conversations to surface trends, sentiment and consumer insight for enterprises and large agencies.',best:'Enterprises and large agencies needing deep listening.',features:['Large-scale listening','Sentiment and trend analysis','Custom dashboards','AI-powered insights']},
  {id:'viewmetrics',name:'ViewMetrics',cat:'analytics',price:'Freemium',url:'https://viewmetrics.com',tested:false,editorPick:false,color:'#FF7A00',tagline:'Track impressions, engagement and growth for your X account.',desc:'ViewMetrics turns your X data into clear dashboards — impressions, engagement rate and follower growth — for solo consultants and small agencies.',best:'Solo consultants and small agencies tracking performance.',features:['Impression and engagement tracking','Growth dashboards','Post performance breakdown','Exportable reports']},
  {id:'metricool',name:'Metricool',cat:'analytics',price:'Freemium',url:'https://metricool.com',tested:true,editorPick:false,color:'#00BA7C',tagline:'Analytics, scheduling and reporting across X and beyond.',desc:'Metricool combines multi-channel analytics, scheduling and white-label reports in an affordable tool loved by freelancers and small agencies.',best:'Freelancers, agencies and small teams.',features:['Multi-channel analytics','Scheduling calendar','White-label reports','Competitor tracking']},
  {id:'twitonomy',name:'Twitonomy',cat:'analytics',price:'Freemium',url:'https://twitonomy.com',tested:false,editorPick:false,color:'#1D9BF0',tagline:'Detailed, visual analytics for any X account.',desc:'Twitonomy provides visual reports on tweets, mentions, followers and engagement for any public account — a classic X analytics staple.',best:'Marketers and individuals analyzing accounts.',features:['Detailed tweet analytics','Follower insights','Mention tracking','Exportable data']},
  {id:'ilo',name:'Ilo.so',cat:'analytics',price:'Paid',url:'https://ilo.so',tested:true,editorPick:false,color:'#7856FF',tagline:'Beautiful X analytics that show what actually grows your account.',desc:'ilo turns your X data into clear insight — which posts convert to followers, best posting windows and growth trends in a polished dashboard.',best:'Creators and individuals tracking growth milestones.',features:['Follower-conversion per post','Best-time-to-post heatmaps','Growth trend dashboards','Weekly performance digests']},
  {id:'deepclick',name:'DeepClick',cat:'analytics',price:'Paid',url:'https://deepclick.com',tested:false,editorPick:false,color:'#FF7A00',tagline:'Post-click attribution for the links you share on X.',desc:'DeepClick tracks what happens after the click — traffic, conversions and revenue from your X links — so advertisers can prove real ROI.',best:'Advertisers needing post-click attribution.',features:['Link click attribution','Conversion tracking','Campaign ROI reports','UTM automation']},
  {id:'socialinsider',name:'Socialinsider',cat:'analytics',price:'Paid',url:'https://socialinsider.io',tested:false,editorPick:false,color:'#F91880',tagline:'Competitive benchmarking and analytics for social teams.',desc:'Socialinsider benchmarks your X performance against competitors, tracks campaigns and generates shareable reports for brands and agencies.',best:'Brands doing competitive benchmarking.',features:['Competitor benchmarking','Campaign analytics','Automated reports','Content performance']},
  {id:'volumn',name:'Volumn.ai',cat:'ai',price:'Paid',url:'https://volumn.ai',tested:false,editorPick:false,color:'#F91880',tagline:'AI that helps you reply and engage at high volume on X.',desc:'Volumn suggests on-brand replies and helps founders and growth teams keep up consistent, high-quality engagement without lurking all day.',best:'Founders, indie hackers and growth teams.',features:['AI reply suggestions','Target account lists','Engagement tracking','In-feed extension']},
  {id:'manychat',name:'Manychat',cat:'ai',price:'Paid',url:'https://manychat.com',tested:true,editorPick:true,color:'#1D9BF0',tagline:'Automate DMs and build complex chat workflows.',desc:'Manychat powers automated DM flows and chatbots that capture leads, answer questions and drive sales across X and other messaging channels.',best:'Brands needing complex DM automation workflows.',features:['Visual DM flow builder','Keyword triggers','Lead capture','CRM integrations']},
  {id:'autopublix',name:'AutoPubliX',cat:'ai',price:'Paid',url:'https://autopublix.com',tested:false,editorPick:false,color:'#00A9C0',tagline:'Set up automated DM replies on X in minutes.',desc:'AutoPubliX makes DM automation beginner-friendly — connect your account and launch auto-reply and welcome flows without a learning curve.',best:'Beginners and creators seeking quick DM setup.',features:['Quick DM automation setup','Auto-reply templates','Welcome messages','Simple dashboard']},
  {id:'dmdad',name:'DM Dad',cat:'ai',price:'Paid',url:'https://dmdad.com',tested:false,editorPick:false,color:'#E8A400',tagline:'Automate outreach DMs to book more conversations.',desc:'DM Dad helps salespeople and founders run personalized outbound DM campaigns on X, turning cold profiles into booked conversations.',best:'Salespeople, marketers and founders doing DM outreach.',features:['Bulk personalized DMs','Outreach sequences','Reply tracking','Prospect lists']},
  {id:'xpro',name:'X Pro (TweetDeck)',cat:'listening',price:'Paid',url:'https://pro.x.com',tested:true,editorPick:false,color:'#1D9BF0',tagline:'The multi-column dashboard for monitoring X in real time.',desc:'X Pro (formerly TweetDeck) gives power users customizable columns to monitor timelines, searches, lists and mentions all at once.',best:'Power users monitoring multiple timelines.',features:['Customizable column decks','Real-time monitoring','Multi-account switching','Advanced search columns']},
  {id:'brandbird',name:'BrandBird',cat:'design',price:'Paid',url:'https://brandbird.app',tested:false,editorPick:false,color:'#FF7A00',tagline:'Turn screenshots and posts into polished branded graphics.',desc:'BrandBird helps creators beautify screenshots, mockups and social graphics with backgrounds, devices and brand kits in seconds.',best:'Creators and brand builders making polished visuals.',features:['Screenshot beautifier','Device mockups','Brand kit presets','One-click export']},
  {id:'tweetpik',name:'TweetPik',cat:'design',price:'Paid',url:'https://tweetpik.com',tested:false,editorPick:false,color:'#F91880',tagline:'Turn tweets into beautiful images for cross-posting.',desc:'TweetPik renders any post as a customizable, on-brand image so you can share X content beautifully on other platforms.',best:'Creators cross-posting X content visually.',features:['Tweet-to-image rendering','Custom themes and colors','Bulk export','API access']},
  {id:'beautifythis',name:'Beautify This',cat:'design',price:'Freemium',url:'https://tweets.beauty',tested:false,editorPick:false,color:'#00A9C0',tagline:'Make your posts look stunning with one-click styling.',desc:'Beautify This transforms plain posts and screenshots into eye-catching, shareable graphics with templates and backgrounds — no design skills needed.',best:'Content creators who want quick, good-looking visuals.',features:['One-click beautify','Template gallery','Background and gradient library','Free tier']},
  {id:'pfpmaker',name:'Profile Pic Maker',cat:'design',price:'Freemium',url:'https://pfpmaker.com',tested:false,editorPick:false,color:'#7856FF',tagline:'Create a clean, branded profile picture in seconds.',desc:'Profile Pic Maker removes your background and generates polished, on-brand avatar options for your X profile automatically.',best:'Users needing a branded avatar fast.',features:['Auto background removal','Branded avatar styles','Multiple variations','Free downloads']},
  {id:'pictory',name:'Pictory',cat:'design',price:'Paid',url:'https://pictory.ai',tested:false,editorPick:false,color:'#F91880',tagline:'Turn long videos and scripts into short clips for X.',desc:'Pictory uses AI to cut long videos into short, captioned clips perfect for posting on X, with no editing experience required.',best:'Video creators needing short snippets.',features:['AI video-to-shorts','Auto captions','Script-to-video','Branded templates']},
  {id:'loom',name:'Loom',cat:'design',price:'Freemium',url:'https://loom.com',tested:true,editorPick:true,color:'#7856FF',tagline:'Record quick screen and camera videos to share on X.',desc:'Loom lets founders record screen-and-camera videos in seconds and share an instant link — great for demos, updates and threads.',best:'Founders recording screen guides and demos.',features:['Instant screen recording','Camera bubble overlay','Shareable video links','Viewer analytics']},
  {id:'krisp',name:'Krisp',cat:'design',price:'Freemium',url:'https://krisp.ai',tested:true,editorPick:false,color:'#00BA7C',tagline:'AI noise cancellation for clean audio in your videos.',desc:'Krisp removes background noise and echo from your microphone in real time, so recordings and live audio for X sound professional.',best:'Creators needing clean audio and noise cancellation.',features:['Real-time noise removal','Echo cancellation','Meeting transcription','Works with any app']},
  {id:'birdy',name:'Birdy.so',cat:'audit',price:'Paid',url:'https://birdy.so',tested:false,editorPick:false,color:'#FF7A00',tagline:'A/B test your bio and profile to convert more followers.',desc:'Birdy helps creators experiment with bios, pinned posts and profile setups, measuring which variations turn visitors into followers.',best:'Creators A/B testing bio conversions.',features:['Bio A/B testing','Profile conversion tracking','Pinned-post experiments','Visitor insights']},
  {id:'followeraudit',name:'FollowerAudit',cat:'audit',price:'Freemium',url:'https://followeraudit.com',tested:false,editorPick:false,color:'#1D9BF0',tagline:'Detect fake and spam followers on any X account.',desc:'FollowerAudit scans an account and flags fake, inactive and spam followers, giving brands a clear picture of real audience quality.',best:'Brands checking for fake or spam followers.',features:['Fake-follower detection','Audience quality score','Detailed audit reports','Multi-account audits']},
  {id:'twitteraudit',name:'Twitter Audit',cat:'audit',price:'Freemium',url:'https://twitteraudit.com',tested:false,editorPick:false,color:'#00BA7C',tagline:'A quick score of how real your followers are.',desc:'Twitter Audit samples your followers and estimates what share are real versus fake — a fast health check for any account.',best:'Users checking overall audience health.',features:['Fast follower sampling','Real-vs-fake score','Shareable audit badge','Historical audits']},
  {id:'untweeps',name:'Untweeps',cat:'audit',price:'Freemium',url:'https://untweeps.com',tested:false,editorPick:false,color:'#7856FF',tagline:'Unfollow inactive accounts to clean up your feed.',desc:'Untweeps finds accounts that haven’t posted in a set number of days so you can unfollow inactive users and tidy your following list.',best:'Marketers cleaning up inactive accounts.',features:['Find inactive follows','Bulk unfollow','Custom inactivity window','Whitelist accounts']},
  {id:'tweetsmash',name:'Tweetsmash',cat:'comments',price:'Paid',url:'https://tweetsmash.com',tested:false,editorPick:false,color:'#7856FF',tagline:'Turn X bookmarks into an organized, searchable library.',desc:'Tweetsmash syncs your bookmarks, auto-categorizes them and pushes them to Notion so you never lose a saved post again.',best:'Power users and Notion users managing bookmarks.',features:['Bookmark sync and tagging','Notion export','Full-text search','Email digests']},
  {id:'dewey',name:'Dewey',cat:'comments',price:'Paid',url:'https://getdewey.co',tested:false,editorPick:false,color:'#1D9BF0',tagline:'Search, organize and back up your X bookmarks.',desc:'Dewey imports all your bookmarks into a searchable, taggable database and keeps a backup — built for heavy bookmarkers and researchers.',best:'Heavy bookmarkers who need search and backup.',features:['Bookmark import and backup','Tags and folders','Powerful search','CSV export']},
  {id:'twitterbiogen',name:'Twitter Bio Generator',cat:'bio',price:'Free',url:'https://twitterbiogenerator.com',tested:false,editorPick:false,color:'#E8A400',tagline:'Generate a punchy X bio in seconds.',desc:'Twitter Bio Generator creates catchy, on-brand bio options from a few keywords — free inspiration for a profile that converts.',best:'Creators needing bio inspiration.',features:['AI bio generation','Multiple style options','Keyword-based prompts','Free to use']},
  {id:'ritetag',name:'RiteTag',cat:'schedule',price:'Paid',url:'https://ritetag.com',tested:false,editorPick:false,color:'#7856FF',tagline:'Get instant, contextual hashtag suggestions as you write.',desc:'RiteTag analyzes your post and image to suggest hashtags proven to get seen, color-coding them by how well they perform right now.',best:'Creators needing contextual hashtag suggestions.',features:['Real-time hashtag suggestions','Color-coded performance','Image-based tags','Browser extension']},
  {id:'glance',name:'Glance',cat:'listening',price:'Freemium',url:'https://glance.com',tested:false,editorPick:false,color:'#1D9BF0',tagline:'Keep an eye on competitor activity across X.',desc:'Glance monitors the accounts you care about and surfaces their notable posts and changes, so you always know what competitors are doing.',best:'Users checking competitor activity.',features:['Competitor monitoring','Activity alerts','Notable-post surfacing','Watchlists']},
  {id:'daily140',name:'Daily140',cat:'listening',price:'Free',url:'https://daily140.com',tested:false,editorPick:false,color:'#00BA7C',tagline:'A daily email digest of what competitors posted on X.',desc:'Daily140 emails you a concise daily digest of the posts from accounts you track, so you can stay on top of competitors without scrolling.',best:'Users wanting daily competitor digests.',features:['Daily email digests','Track any accounts','Concise summaries','Free to use']},
  {id:'xautopilot',name:'X-Autopilot',cat:'ai',price:'Paid',url:'https://xautopilot.app',tested:false,editorPick:false,color:'#F91880',tagline:'Automate replies and engagement on X, hands-free.',desc:'X-Autopilot runs AI-driven replies, follows and engagement automatically so founders can grow their presence without the manual grind.',best:'Founders automating day-to-day engagement.',features:['AI auto-replies','Scheduled engagement','Target account lists','Growth automation']},
  {id:'deviai',name:'Devi AI',cat:'ai',price:'Paid',url:'https://ddevi.com',tested:false,editorPick:false,color:'#1D9BF0',tagline:'Monitor keywords and let AI draft high-intent replies.',desc:'Devi watches X and other networks for keywords that signal buying intent, then drafts on-brand replies so you turn conversations into leads.',best:'Founders doing lead-gen through helpful replies.',features:['Keyword and intent monitoring','AI-drafted replies','Lead scoring','Outreach scheduling']},
  {id:'replyguy',name:'ReplyGuy',cat:'ai',price:'Paid',url:'https://replyguy.com',tested:false,editorPick:false,color:'#00A9C0',tagline:'AI finds relevant posts and drafts replies that mention your product.',desc:'ReplyGuy surfaces posts where your product is a genuine answer and drafts natural replies, helping indie makers get discovered organically.',best:'Indie makers driving product mentions.',features:['Relevant-post discovery','AI reply drafting','Product-mention tuning','Volume controls']},
  {id:'agorapulse',name:'Agorapulse',cat:'schedule',price:'Paid',url:'https://agorapulse.com',tested:true,editorPick:false,color:'#7856FF',tagline:'Social inbox, scheduling and reporting for busy teams.',desc:'Agorapulse pairs a unified inbox with scheduling, listening and clear reports, built for agencies managing multiple X accounts.',best:'Agencies and teams managing multiple accounts.',features:['Unified social inbox','Scheduling and queues','Team collaboration','ROI reporting']},
  {id:'zlappo',name:'Zlappo',cat:'schedule',price:'Paid',url:'https://zlappo.com',tested:false,editorPick:false,color:'#1D9BF0',tagline:'All-in-one thread scheduling and automation for solo creators.',desc:'Zlappo offers thread scheduling, auto-retweets, evergreen recycling and analytics in one affordable tool for independent X creators.',best:'Solo X creators automating their output.',features:['Thread scheduling','Auto-retweets','Evergreen recycling','Analytics']},
  {id:'feedhive',name:'FeedHive',cat:'schedule',price:'Paid',url:'https://feedhive.com',tested:false,editorPick:false,color:'#7856FF',tagline:'AI-assisted scheduling with recycling and conditional actions.',desc:'FeedHive combines scheduling, AI writing help and clever automation — like auto-plugging a link once a post takes off — in a modern interface.',best:'Solo creators who want smart automation without complexity.',features:['AI content assistant','Conditional auto-plug actions','Evergreen recycling','Best-time predictions']},
  {
    id:'cogsend',name:'CogSend',cat:'schedule',price:'Free',url:'https://cogsend.com',icon:'https://www.google.com/s2/favicons?domain_url=https%3A%2F%2Fcogsend.com&sz=128',tested:false,editorPick:false,color:'#0F1419',addedAt:'2026-09-29',lastChecked:'2026-09-29',
    tagline:'Self-host an open-source scheduler for X and other social networks.',
    desc:'CogSend is an open-source social media scheduler that runs on your own Cloudflare account. It supports publishing workflows for X alongside Mastodon, Bluesky, LinkedIn and Threads.',
    best:'Technical creators and small teams who want to own their scheduling infrastructure.',
    features:['Self-hosted on Cloudflare','Open-source codebase','Multi-network scheduling','Designed for low-cost deployment'],
    demoPostUrl:'https://x.com/DeepakNesss/status/2103816517955776703/photo/1',
    demoSummary:'An open-source scheduler for X and other networks that you can self-host on a Cloudflare account.',
    founderHandle:'DeepakNesss',launchedAt:'2026-09-26',shippedOnXOrder:1
  },
  {
    id:'schedpilot',name:'SchedPilot',cat:'schedule',price:'Paid',url:'https://schedpilot.com',icon:'https://www.google.com/s2/favicons?domain_url=https%3A%2F%2Fschedpilot.com&sz=128',tested:false,editorPick:false,color:'#1D9BF0',addedAt:'2026-09-29',lastChecked:'2026-09-29',
    tagline:'Let AI agents draft and schedule social posts through an API and MCP server.',
    desc:'SchedPilot connects assistants such as Claude, ChatGPT and Cursor to social publishing workflows through its API and MCP server, including scheduling for X and eight other networks.',
    best:'Builders and agencies that want agents to operate their multi-network publishing queue.',
    features:['MCP server for AI agents','Publishing API','Nine supported social networks','Multi-account scheduling'],
    demoPostUrl:'https://x.com/asaio87/status/2086090605738803498',
    demoSummary:'Claude creates and schedules posts through SchedPilot’s MCP connection without opening a scheduling dashboard.',
    founderHandle:'asaio87',launchedAt:'2026-08-08',shippedOnXOrder:2
  },
  {id:'superx',name:'SuperX',cat:'growth',price:'Paid',url:'https://superx.so',icon:'https://www.google.com/s2/favicons?domain_url=https%3A%2F%2Fsuperx.so&sz=128',tested:false,editorPick:false,color:'#0F1419',addedAt:'2026-09-29',lastChecked:'2026-09-29',tagline:'Create, schedule and analyze X content from one growth workspace.',desc:'SuperX combines an X-focused web app and Chrome extension for writing, scheduling, engagement, analytics, direct messages and agent access.',best:'Creators who want an X-native growth suite with in-feed analytics.',notFor:'Teams that need a broad multi-network publishing calendar.',features:['X post and thread writer','Smart scheduling','In-feed Chrome analytics','API, CLI and MCP access']},
  {id:'xsaved',name:'XSaved',cat:'comments',price:'Freemium',url:'https://www.xsaved.com',icon:'https://www.google.com/s2/favicons?domain_url=https%3A%2F%2Fwww.xsaved.com&sz=128',tested:false,editorPick:false,color:'#0F1419',addedAt:'2026-09-29',lastChecked:'2026-09-29',tagline:'Search, organize and export thousands of X bookmarks.',desc:'XSaved turns X bookmarks into a searchable library with folders, filters and export tools through a Chrome extension and iPhone app.',best:'People with large X bookmark collections who need reliable retrieval.',notFor:'Scheduling posts or analyzing account performance.',features:['Full-text bookmark search','Folders and filters','Bookmark export','Chrome extension and iPhone app']},
  {id:'sendezeit',name:'Sendezeit',cat:'schedule',price:'Paid',url:'https://sendezeit.app',icon:'https://www.google.com/s2/favicons?domain_url=https%3A%2F%2Fsendezeit.app&sz=128',tested:false,editorPick:false,color:'#7856FF',addedAt:'2026-09-29',lastChecked:'2026-09-29',tagline:'Adapt one source into reviewed, native posts for each channel.',desc:'Sendezeit gives founder-led teams a source-first workflow for adapting, approving and confirming posts across X and other channels, with an X reply finder on higher plans.',best:'Founders who want explicit approval and delivery confirmation across channels.',notFor:'People looking for a permanent free scheduler.',features:['Source-linked channel adaptations','Approval before publishing','Delivery confirmation','X reply finder']},
  {id:'pilotmyx',name:'PilotMyX',cat:'analytics',price:'Paid',url:'https://pilotmyx.com',icon:'https://www.google.com/s2/favicons?domain_url=https%3A%2F%2Fpilotmyx.com&sz=128',tested:false,editorPick:false,color:'#1D9BF0',addedAt:'2026-09-29',lastChecked:'2026-09-29',tagline:'Turn your X performance history into analytics, drafts and a publishing plan.',desc:'PilotMyX analyzes posts and replies, schedules approved posts and exposes account context to AI assistants through an MCP server.',best:'Creators who want agents to draft from their own proven X patterns.',notFor:'Publishing connected reply threads or automating replies.',features:['Post and reply analytics','Account-specific writing insights','Post scheduling','MCP access for assistants']},
  {id:'voicepost',name:'VoicePost',cat:'content',price:'Paid',url:'https://voicepo.st',icon:'https://www.google.com/s2/favicons?domain_url=https%3A%2F%2Fvoicepo.st&sz=128',tested:false,editorPick:false,color:'#F91880',addedAt:'2026-09-29',lastChecked:'2026-09-29',tagline:'Draft and schedule voice-matched content for X and Reddit.',desc:'VoicePost monitors relevant conversations and news, drafts posts in a chosen voice and lets users approve, schedule and publish on X while keeping Reddit submission manual.',best:'Indie founders building audiences on both X and Reddit.',notFor:'Teams needing a broad agency approval system.',features:['Voice-matched drafts','Trend and conversation monitoring','X scheduling and publishing','Reddit-safe manual handoff']},
  {id:'climbx',name:'ClimbX',cat:'growth',price:'Paid',url:'https://climbx.so',icon:'https://www.google.com/s2/favicons?domain_url=https%3A%2F%2Fclimbx.so&sz=128',tested:false,editorPick:false,color:'#00BA7C',addedAt:'2026-09-29',lastChecked:'2026-09-29',tagline:'Research winning X posts, write in your voice and schedule consistently.',desc:'ClimbX surfaces posts performing in a creator’s niche, generates voice-matched drafts and combines scheduling, engagement and analytics in an X-first workflow.',best:'Solo founders using research-led content and deliberate engagement to grow.',notFor:'Multi-network social teams.',features:['Niche post research','Voice-trained drafting','Post and thread scheduling','API and MCP access']},
  {id:'xpert',name:'Xpert',cat:'growth',price:'Paid',url:'https://xpert.so',icon:'https://www.google.com/s2/favicons?domain_url=https%3A%2F%2Fxpert.so&sz=128',tested:false,editorPick:false,color:'#1D9BF0',addedAt:'2026-09-29',lastChecked:'2026-09-29',tagline:'Write, score, schedule and analyze X posts in your own voice.',desc:'Xpert learns from an account’s history, scores drafts before publishing, schedules posts and replies, and connects its queue and analytics to agents through MCP and REST.',best:'X creators who want a data-informed writing and agent workflow.',notFor:'Multi-network social publishing.',features:['Voice-trained post and thread drafting','Pre-publish scoring','Audience-aware scheduling','MCP, CLI and REST access']},
  {id:'voicemoat',name:'VoiceMoat',cat:'content',price:'Freemium',url:'https://voicemoat.com',icon:'https://www.google.com/s2/favicons?domain_url=https%3A%2F%2Fvoicemoat.com&sz=128',tested:false,editorPick:false,color:'#7856FF',addedAt:'2026-09-29',lastChecked:'2026-09-29',tagline:'Draft posts and replies with a measurable voice-match score.',desc:'VoiceMoat trains on a creator’s writing, generates posts, replies and threads for X and LinkedIn, and offers scheduling, analytics, a Chrome extension and MCP access.',best:'Creators who care about keeping AI-assisted writing recognizably theirs.',notFor:'Brands that need many social networks beyond X and LinkedIn.',features:['Voice DNA and match scoring','Posts, replies and thread drafts','Scheduling and analytics','Chrome extension and MCP server']},
  {id:'postiz',name:'Postiz',cat:'schedule',price:'Freemium',url:'https://postiz.com',icon:'https://www.google.com/s2/favicons?domain_url=https%3A%2F%2Fpostiz.com&sz=128',tested:false,editorPick:false,color:'#612BD3',addedAt:'2026-09-29',lastChecked:'2026-09-29',tagline:'Open-source, agent-ready scheduling across more than 30 channels.',desc:'Postiz is a hosted and self-hostable social scheduler with a visual calendar, AI agents, analytics, public API, webhooks and MCP integrations.',best:'Builders and teams that want open-source control or agent-driven multi-network publishing.',notFor:'People seeking an X-only interface.',features:['AGPL-licensed self-hosted edition','Hosted multi-network scheduler','MCP and public API','Visual calendar and analytics']},
  {id:'mentionspot',name:'MentionSpot',cat:'listening',price:'Paid',url:'https://www.mentionspot.com',icon:'https://www.google.com/s2/favicons?domain_url=https%3A%2F%2Fwww.mentionspot.com&sz=128',tested:false,editorPick:false,color:'#FF7A00',addedAt:'2026-09-29',lastChecked:'2026-09-29',tagline:'Surface high-intent buyer conversations across X and Reddit.',desc:'MentionSpot monitors keywords and competitors across X and Reddit, scores conversations for buying intent, and delivers timely alerts without generating automated replies.',best:'Founders and small teams looking for relevant conversations to answer themselves.',notFor:'Automated reply generation or social publishing.',features:['X and Reddit monitoring','Intent and relevance scoring','Competitor mention tracking','Real-time alerts and daily digests']},
  {
    id:'socialpilot',name:'SocialPilot',cat:'schedule',price:'Paid',url:'https://socialpilot.co',tested:true,editorPick:false,color:'#FF7A00',tagline:'Affordable scheduling and analytics for agencies.',desc:'SocialPilot delivers bulk scheduling, client management and white-label reports at an agency-friendly price.',best:'Budget-conscious agencies.',features:['Bulk scheduling','Client management','White-label reports','Content calendar'],
    demoPostUrl:'https://x.com/socialpilot_co/status/2098767352070295634',
    demoSummary:'A Claude-to-SocialPilot MCP workflow for researching, drafting and scheduling social content.',
    launchedAt:'2026-09-12',shippedOnXOrder:3
  },
  {
    id:'publer',name:'Publer',cat:'schedule',price:'Freemium',url:'https://publer.io',tested:true,editorPick:false,color:'#7856FF',tagline:'Bulk-schedule, recycle and collaborate affordably.',desc:'Publer offers powerful scheduling at a friendly price — bulk upload, recycle evergreen posts, preview your feed and work with a team.',best:'Budget-conscious creators who want pro features.',features:['Bulk CSV scheduling','Auto-recycle evergreen content','Feed preview and first comment','Affordable team plans'],
    demoPostUrl:'https://x.com/publer/status/2073014191301017930',
    demoSummary:'Connect Publer to ChatGPT or Claude through its MCP server and manage publishing with prompts.',
    launchedAt:'2026-07-03',shippedOnXOrder:4
  },
  {id:'sendible',name:'Sendible',cat:'schedule',price:'Paid',url:'https://sendible.com',tested:true,editorPick:false,color:'#00BA7C',tagline:'Agency-focused social management and scheduling.',desc:'Sendible centralizes scheduling, a priority inbox and client reporting for agencies handling many brands on X and beyond.',best:'Agencies managing client accounts.',features:['Scheduling and queues','Priority inbox','Client reports','Content suggestions']},
  {id:'loomly',name:'Loomly',cat:'schedule',price:'Paid',url:'https://loomly.com',tested:false,editorPick:false,color:'#1D9BF0',tagline:'A brand-success platform for planning and approving posts.',desc:'Loomly guides small teams through planning, approval workflows and publishing, with post ideas and optimization tips along the way.',best:'Small teams needing approval workflows.',features:['Post ideas and tips','Approval workflows','Content calendar','Analytics']},
  {id:'meetedgar',name:'MeetEdgar',cat:'schedule',price:'Paid',url:'https://meetedgar.com',tested:false,editorPick:false,color:'#00BA7C',tagline:'Category-based evergreen scheduling that recycles for you.',desc:'MeetEdgar organizes posts into categories and automatically recycles evergreen content so your X feed never goes quiet.',best:'Creators wanting hands-off evergreen posting.',features:['Category-based library','Automatic recycling','Best-time posting','Variations to avoid repeats']},
  {id:'socialbee',name:'SocialBee',cat:'schedule',price:'Paid',url:'https://socialbee.com',tested:true,editorPick:false,color:'#FF7A00',tagline:'Category-based scheduling that keeps your feed balanced.',desc:'SocialBee organizes posts into content categories and cycles through them, so your X feed always mixes value, promotion and engagement.',best:'Solopreneurs wanting a balanced content mix.',features:['Category content queues','Evergreen recycling','AI post generation','Team collaboration']},
  {id:'contentstudio',name:'ContentStudio',cat:'schedule',price:'Paid',url:'https://contentstudio.io',tested:false,editorPick:false,color:'#7856FF',tagline:'Content discovery, planning and scheduling in one hub.',desc:'ContentStudio pairs trending-content discovery with scheduling, AI writing and analytics to keep creators consistently posting quality.',best:'Creators who plan around trending content.',features:['Content discovery','AI composer','Scheduling and automation','Analytics']},
  {id:'vistasocial',name:'Vista Social',cat:'schedule',price:'Paid',url:'https://vistasocial.com',tested:true,editorPick:false,color:'#1D9BF0',tagline:'Modern social management with scheduling, inbox and reports.',desc:'Vista Social is an all-in-one manager — schedule to X, handle a unified inbox, run link-in-bio pages and generate white-label reports.',best:'Agencies managing X for multiple clients.',features:['Unified social inbox','White-label client reports','Link-in-bio builder','AI caption assistant']},
  {id:'napoleoncat',name:'NapoleonCat',cat:'schedule',price:'Paid',url:'https://napoleoncat.com',tested:false,editorPick:false,color:'#F91880',tagline:'Engagement, moderation and analytics for brands.',desc:'NapoleonCat centralizes comments and messages, automates moderation and reports on performance for brands managing X at scale.',best:'Brands managing engagement at scale.',features:['Unified engagement inbox','Auto-moderation rules','Scheduling','Reporting']},
  {id:'statusbrew',name:'Statusbrew',cat:'schedule',price:'Paid',url:'https://statusbrew.com',tested:false,editorPick:false,color:'#00A9C0',tagline:'Scheduling, inbox and audience management for teams.',desc:'Statusbrew combines publishing, a conversations inbox and rules-based automation for teams managing X and other channels.',best:'Teams managing conversations and publishing.',features:['Publishing calendar','Conversations inbox','Automation rules','Reports']},
  {id:'coschedule',name:'CoSchedule',cat:'schedule',price:'Freemium',url:'https://coschedule.com',tested:true,editorPick:false,color:'#FF7A00',tagline:'A marketing calendar that unifies all your content.',desc:'CoSchedule brings your X posts, blog and campaigns onto one marketing calendar with scheduling and workflow tools for content teams.',best:'Content teams coordinating campaigns.',features:['Unified marketing calendar','Social scheduling','Workflow and approvals','Best-time scheduling']},
  {id:'socialchamp',name:'Social Champ',cat:'schedule',price:'Freemium',url:'https://socialchamp.io',tested:false,editorPick:false,color:'#00BA7C',tagline:'Affordable scheduling with bulk upload and recycling.',desc:'Social Champ offers bulk scheduling, content recycling and analytics on a generous free tier aimed at budget-minded creators.',best:'Budget creators wanting solid scheduling.',features:['Bulk scheduling','Content recycling','AI content suggestions','Analytics']},
  {id:'later',name:'Later',cat:'schedule',price:'Freemium',url:'https://later.com',tested:true,editorPick:false,color:'#1D9BF0',tagline:'Visual-first scheduling and planning.',desc:'Later focuses on a visual content calendar and easy scheduling, with a link-in-bio tool, popular with casual users and brands alike.',best:'Casual users and brands planning visually.',features:['Visual content calendar','Drag-and-drop scheduling','Link-in-bio','Basic analytics']},
  {id:'postwise',name:'Postwise',cat:'content',price:'Paid',url:'https://postwise.ai',tested:true,editorPick:false,color:'#00BA7C',tagline:'AI that writes scroll-stopping posts and threads in your voice.',desc:'Postwise generates hooks, tweets and threads designed for engagement, schedules them and grows your following with a built-in ghostwriter.',best:'Creators who want AI posts that still sound like them.',features:['AI ghostwriter for X','Hook and thread generators','Best-time scheduling','Grow tab for follower gains']},
  {id:'typeshare',name:'Typeshare',cat:'content',price:'Freemium',url:'https://typeshare.co',tested:false,editorPick:false,color:'#FF7A00',tagline:'A daily writing habit builder for X and beyond.',desc:'Typeshare gives writers templates and prompts to publish consistently, turning a daily writing habit into an audience on X.',best:'Creators building a daily writing habit.',features:['Writing templates and prompts','Daily habit tracking','One-click publish','Analytics']},
  {id:'minterio',name:'Minter.io',cat:'analytics',price:'Paid',url:'https://minter.io',tested:false,editorPick:false,color:'#7856FF',tagline:'In-depth analytics and reports for social accounts.',desc:'Minter.io generates detailed analytics and shareable reports on audience, engagement and hashtags for brands and agencies.',best:'Brands and agencies needing detailed reports.',features:['Detailed account analytics','Hashtag performance','Competitor tracking','Exportable reports']},
  {id:'socialblade',name:'Social Blade',cat:'analytics',price:'Freemium',url:'https://socialblade.com',tested:true,editorPick:false,color:'#FF7A00',tagline:'Public statistics and rankings for any account.',desc:'Social Blade tracks public follower stats, growth history and rankings for any account — a go-to for quick competitive snapshots.',best:'Users wanting public account stats.',features:['Public follower stats','Growth history','Account rankings','Estimated reach']},
  {id:'tweetbinder',name:'Tweet Binder',cat:'analytics',price:'Freemium',url:'https://tweetbinder.com',tested:false,editorPick:false,color:'#1D9BF0',tagline:'Hashtag and campaign analytics for X.',desc:'Tweet Binder measures hashtags, campaigns and events on X with reach, impressions and contributor breakdowns for agencies.',best:'Agencies running hashtag campaigns.',features:['Hashtag campaign reports','Reach and impressions','Contributor analysis','Exportable data']},
  {id:'linktree',name:'Linktree',cat:'bio',price:'Freemium',url:'https://linktr.ee',tested:true,editorPick:true,color:'#00BA7C',tagline:'The link-in-bio standard for creators.',desc:'Linktree turns your single bio link into a hub for everything you share, with click analytics and monetization blocks.',best:'Online creators centralizing their links.',features:['One link for everything','Click analytics','Monetization blocks','Custom themes']},
  {id:'beacons',name:'Beacons',cat:'bio',price:'Freemium',url:'https://beacons.ai',tested:true,editorPick:false,color:'#F91880',tagline:'A link-in-bio that doubles as a creator store.',desc:'Beacons combines a link-in-bio page with a store, email tools and a media kit so creators can sell straight from their X bio.',best:'Creators who want to sell from their bio.',features:['Link-in-bio and store','Email capture','Media kit','Monetization tools']},
  {id:'biolink',name:'Bio.link',cat:'bio',price:'Freemium',url:'https://bio.link',tested:false,editorPick:false,color:'#00A9C0',tagline:'A fast, simple hosted bio-link page.',desc:'Bio.link offers a clean, quick-to-set-up bio page to collect your links, with basic analytics and a free tier.',best:'Users wanting simple, no-fuss bio hosting.',features:['Quick bio page setup','Unlimited links','Basic analytics','Free tier']},
  {id:'keyhole',name:'Keyhole',cat:'listening',price:'Paid',url:'https://keyhole.co',tested:false,editorPick:false,color:'#FF7A00',tagline:'Real-time hashtag, campaign and influencer analytics.',desc:'Keyhole tracks hashtags, campaigns and influencers in real time, measuring reach and sentiment for agencies and brands.',best:'Agencies and brands tracking campaigns.',features:['Real-time hashtag tracking','Campaign dashboards','Influencer analytics','Sentiment analysis']},
  {id:'brand24',name:'Brand24',cat:'listening',price:'Paid',url:'https://brand24.com',tested:true,editorPick:false,color:'#F91880',tagline:'Real-time media monitoring and sentiment for your brand.',desc:'Brand24 tracks every mention of your brand or keywords across X and the web in real time, with sentiment analysis and instant alerts.',best:'Brands needing reputation and sentiment analysis.',features:['Real-time mention tracking','Sentiment analysis','Influencer scoring','Spike alerts']},
  {id:'mention',name:'Mention',cat:'listening',price:'Paid',url:'https://mention.com',tested:true,editorPick:false,color:'#8B5CF6',tagline:'Monitor mentions and manage social at scale.',desc:'Mention watches the web and X for your brand, competitors and keywords, pairing listening with publishing for enterprise teams.',best:'Larger enterprise teams monitoring at scale.',features:['Web and social monitoring','Competitive analysis','Publishing tools','Custom alerts']}
];

export const BASE_TOOLS = TOOL_DATA.map(tool => ({
  ...tool,
  ...(CATALOG_CURATION[tool.id] || {}),
  categories: tool.categories ?? [tool.cat],
  addedAt: tool.addedAt ?? null,
  published: tool.published ?? true,
  xFit: CATALOG_CURATION[tool.id]?.xFit ?? tool.xFit ?? 'unknown',
  status: CATALOG_CURATION[tool.id]?.status ?? tool.status ?? 'live',
  apiStatus: CATALOG_CURATION[tool.id]?.apiStatus ?? tool.apiStatus ?? 'unclear',
  founderBuilt: CATALOG_CURATION[tool.id]?.founderBuilt ?? tool.founderBuilt ?? false,
  openSource: CATALOG_CURATION[tool.id]?.openSource ?? tool.openSource ?? false,
  jobs: CATALOG_CURATION[tool.id]?.jobs ?? tool.jobs ?? CATEGORY_JOBS[tool.cat] ?? [],
  networks: CATALOG_CURATION[tool.id]?.networks ?? tool.networks ?? ['x'],
  threadSupport: CATALOG_CURATION[tool.id]?.threadSupport ?? tool.threadSupport ?? '',
  notFor: CATALOG_CURATION[tool.id]?.notFor ?? tool.notFor ?? '',
  startingPrice: CATALOG_CURATION[tool.id]?.startingPrice ?? tool.startingPrice ?? '',
  editorPickOrder: tool.editorPickOrder ?? null,
  demoPostUrl: tool.demoPostUrl ?? '',
  demoSummary: tool.demoSummary ?? '',
  founderHandle: tool.founderHandle ?? '',
  launchedAt: tool.launchedAt ?? null,
  demoImage: tool.demoImage ?? '',
  shippedOnXOrder: tool.shippedOnXOrder ?? null,
  verificationNotes: CATALOG_CURATION[tool.id]?.verificationNotes ?? tool.verificationNotes ?? '',
  verificationSources: CATALOG_CURATION[tool.id]?.verificationSources ?? tool.verificationSources ?? []
}));

export function mergeAdminTools(baseTools = BASE_TOOLS, overrides = adminData, includeUnpublished = false) {
  const records = overrides?.records || {};
  const deleted = new Set(overrides?.deleted || []);
  const seen = new Set();
  const merged = baseTools.map(base => {
    seen.add(base.id);
    const override = records[base.id] || {};
    return {
      ...base,
      ...override,
      detail: { ...(base.detail || {}), ...(override.detail || {}) },
      categories: override.categories?.length ? override.categories : (base.categories || [base.cat]),
      published: override.published ?? base.published ?? true
    };
  });

  Object.values(records).forEach(record => {
    if (!record?.id || seen.has(record.id)) return;
    merged.push({
      color: '#1D9BF0',
      tested: false,
      editorPick: false,
      features: [],
      categories: record.cat ? [record.cat] : [],
      addedAt: new Date().toISOString().slice(0, 10),
      published: true,
      xFit: 'unknown',
      status: 'live',
      apiStatus: 'unclear',
      founderBuilt: false,
      openSource: false,
      jobs: [],
      networks: ['x'],
      threadSupport: '',
      notFor: '',
      startingPrice: '',
      editorPickOrder: null,
      demoPostUrl: '',
      demoSummary: '',
      founderHandle: '',
      launchedAt: null,
      demoImage: '',
      shippedOnXOrder: null,
      verificationNotes: '',
      verificationSources: [],
      ...record,
    });
  });

  return merged.filter(tool => !deleted.has(tool.id) && (includeUnpublished || tool.published !== false));
}

export const ALL_TOOLS = mergeAdminTools(BASE_TOOLS, adminData, true);
export const TOOLS = ALL_TOOLS.filter(tool => tool.published !== false);
