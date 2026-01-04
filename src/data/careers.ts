import type { Career } from '@/types/data'

export const careers: Career[] = [
  {
    id: 'sports-analytics',
    slug: 'sports-analytics',
    name: 'Sports Analytics',
    category: 'data',
    tagline: 'Turn sports data into decisions that win.',
    description: 'Sports analytics roles turn game, tracking, and business data into insights that coaches, front offices, and commercial teams can act on.',
    whatYouDo: [
      'Clean and analyze player/team data (tracking, wearables, video, box score, ticketing).',
      'Build models that explain performance and predict outcomes (injury risk, lineup impact, win probability).',
      'Create dashboards and reports for coaches, scouts, and executives.',
      'Partner with staff to turn questions into measurable metrics and experiments.',
      'Present insights clearly under time pressure (games, draft, trade windows).'
    ],
    salaryRange: {
      entry: '$74,070',
      mid: '$96,835',
      senior: '$128,168'
    },
    pathIn: {
      entryRoles: [
        'Data Analyst (Sports)',
        'Performance Analyst'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Statistical analysis',
        'Data visualization',
        'Programming (R/Python/SQL)',
        'Communication skills'
      ]
    },
    topCompanies: [
      'stats-perform',
      'sportradar',
      'second-spectrum'
    ],
    relatedCareers: [
      'sports-tech',
      'sports-consulting',
      'team-operations',
      'league-operations',
      'sports-betting'
    ],
    dayInLife: 'You start by checking data quality from last night’s game and updating recurring dashboards. Midday is deeper analysis—running queries, validating metrics, and building a quick model or visualization for a coach’s question. Late afternoon is stakeholder time: presenting findings, iterating, and prepping for the next game or scouting cycle.',
    prosAndCons: {
      pros: [
        'Direct impact on decisions (lineups, scouting, strategy).',
        'Transferable analytical toolkit (SQL/Python, stats, visualization).',
        'Fast feedback loop—what you ship gets used quickly.'
      ],
      cons: [
        'Messy data and unclear questions are constant.',
        'You need soft skills; great analysis can still get ignored.',
        'Can include long hours around games/travel windows.'
      ]
    }
  },
  {
    id: 'sports-agent',
    slug: 'sports-agent',
    name: 'Talent Representation',
    category: 'talent',
    tagline: 'Negotiate deals and manage careers for athletes and talent.',
    description: 'Sports agents represent athletes in contracts, endorsements, and career strategy—balancing negotiation, relationships, and brand building.',
    whatYouDo: [
      'Support contract and endorsement negotiations (research, comps, deal terms).',
      'Coordinate client needs across training, legal, PR, and brand partners.',
      'Scout and recruit talent; build long-term relationships.',
      'Track league rules, salary caps, and market dynamics.',
      'Help clients make career decisions: team fit, endorsements, and long-term planning.'
    ],
    salaryRange: {
      entry: '$48,530',
      mid: '$96,310',
      senior: '$168,850'
    },
    pathIn: {
      entryRoles: [
        'Agent Assistant',
        'Contracts Coordinator'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Contract negotiation',
        'Networking & relationships',
        'Sports industry knowledge',
        'Legal and business acumen'
      ]
    },
    topCompanies: [
      'wasserman',
      'creative-artists-agency',
      'excel-sports-management'
    ],
    relatedCareers: [
      'athlete-brand',
      'sports-law',
      'sports-sponsorship',
      'sports-pr',
      'sports-marketing'
    ],
    dayInLife: 'Your day is a mix of calls, deal work, and relationship building. You’ll prepare negotiation materials, coordinate with teams/brands, and handle client logistics. Nights and weekends can spike during free agency, drafts, or major events.',
    prosAndCons: {
      pros: [
        'High upside if you build trust and a strong client roster.',
        'Work sits at the intersection of sports, business, and culture.',
        'Relationship-driven role—your network compounds.'
      ],
      cons: [
        'Unpredictable hours during deal cycles.',
        'Early years can be heavy admin with low autonomy.',
        'High pressure; outcomes depend on factors you don’t control.'
      ]
    }
  },
  {
    id: 'sports-media',
    slug: 'sports-media',
    name: 'Sports Media',
    category: 'media',
    tagline: 'Build and ship sports content products fans actually use.',
    description: 'Sports media careers span strategy, programming, distribution, and product—turning live sports and storytelling into sustainable media businesses.',
    whatYouDo: [
      'Plan content slates and formats across video, audio, social, and written.',
      'Work with rights, partnerships, and platforms to maximize reach and revenue.',
      'Use audience data to decide what to greenlight, iterate, or cancel.',
      'Coordinate talent, production, and editorial teams to ship on time.',
      'Develop monetization strategy (subscriptions, ads, sponsorships, licensing).'
    ],
    salaryRange: {
      entry: 'Unknown',
      mid: 'Unknown',
      senior: 'Unknown'
    },
    pathIn: {
      entryRoles: [],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: []
    },
    topCompanies: [
      'espn',
      'fox-sports'
    ],
    relatedCareers: [
      'sports-journalism',
      'sports-marketing',
      'sports-sponsorship',
      'sports-tech',
      'sports-pr'
    ],
    dayInLife: 'Mornings start with performance review: what content hit, what didn’t, and why. The rest of the day is meetings—production planning, platform coordination, and partner conversations—plus time to write briefs and make calls on what ships next.',
    prosAndCons: {
      pros: [
        'You’re close to culture and storytelling.',
        'Many entry points (editorial, product, partnerships, programming).',
        'Clear portfolio outputs: shows, series, newsletters, formats.'
      ],
      cons: [
        'Industry is volatile; roles change with rights and platform shifts.',
        'You’ll need to prove impact with metrics, not taste alone.',
        'Live sports schedules can create odd hours.'
      ]
    }
  },
  {
    id: 'sports-journalism',
    slug: 'sports-journalism',
    name: 'Sports Journalism',
    category: 'media',
    tagline: 'Report, investigate, and tell the stories behind sports.',
    description: 'Sports journalism focuses on reporting, writing, and publishing stories—breaking news, longform features, and analysis across platforms.',
    whatYouDo: [
      'Report and verify information; build sources across teams, leagues, and agents.',
      'Write game coverage, features, investigations, and explainers.',
      'Pitch story ideas and collaborate with editors and producers.',
      'Appear on podcasts/video to discuss reporting and analysis.',
      'Publish on deadline and update stories as news develops.'
    ],
    salaryRange: {
      entry: '$34,590',
      mid: '$60,280',
      senior: '$162,430'
    },
    pathIn: {
      entryRoles: [
        'Sports Reporter',
        'Editorial Assistant'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Strong writing & storytelling',
        'Interviewing',
        'Knowledge of sports and stats',
        'Deadline management'
      ]
    },
    topCompanies: [
      'espn',
      'the-athletic',
      'sports-illustrated'
    ],
    relatedCareers: [
      'sports-media',
      'sports-pr',
      'sports-analytics',
      'sports-marketing',
      'sports-tech'
    ],
    dayInLife: 'You’re constantly balancing reporting and writing. Mornings are outreach and research; afternoons are interviews and drafting; evenings can be games or live news. The job is about speed *and* accuracy.',
    prosAndCons: {
      pros: [
        'Work that builds a public body of work and credibility.',
        'You learn the industry fast by talking to insiders.',
        'High autonomy for great reporters with strong sources.'
      ],
      cons: [
        'Deadlines and constant news pressure.',
        'Compensation can lag other business roles.',
        'Travel, late nights, and unpredictable breaking news.'
      ]
    }
  },
  {
    id: 'sports-marketing',
    slug: 'sports-marketing',
    name: 'Sports Marketing',
    category: 'business',
    tagline: 'Grow fandom, drive revenue, and build the brand.',
    description: 'Sports marketing roles connect teams, leagues, brands, and fans—using campaigns, content, and partnerships to drive tickets, merchandise, and loyalty.',
    whatYouDo: [
      'Plan campaigns across social, email, paid media, and in-venue experiences.',
      'Build fan segmentation and measure growth (CAC, LTV, engagement).',
      'Coordinate creative, content, and community initiatives.',
      'Work with sponsorship teams to activate partners in authentic ways.',
      'Use analytics to optimize messaging and channel mix.'
    ],
    salaryRange: {
      entry: '$40,000',
      mid: '$79,000',
      senior: '$134,000'
    },
    pathIn: {
      entryRoles: [
        'Marketing Coordinator',
        'Social Media Coordinator'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Creative campaign planning',
        'Brand strategy',
        'Digital marketing & analytics',
        'Communication and teamwork'
      ]
    },
    topCompanies: [
      'nike',
      'octagon',
      'gmr-marketing'
    ],
    relatedCareers: [
      'sports-sponsorship',
      'sports-pr',
      'athlete-brand',
      'sports-media',
      'event-management'
    ],
    dayInLife: 'You’ll review performance dashboards, align with creative on upcoming launches, coordinate with ticketing/commerce on offers, then spend the afternoon executing—publishing, briefing, and iterating based on results.',
    prosAndCons: {
      pros: [
        'Creative + analytical blend; easy to show work.',
        'Many roles across teams, leagues, brands, and agencies.',
        'Skills transfer to any consumer brand.'
      ],
      cons: [
        'Can become execution-heavy without strategic scope.',
        'Stakeholders are many; approvals can slow you down.',
        'Performance pressure is constant during seasons.'
      ]
    }
  },
  {
    id: 'sports-sponsorship',
    slug: 'sports-sponsorship',
    name: 'Sponsorship Sales',
    category: 'business',
    tagline: 'Sell and activate partnerships that create real ROI.',
    description: 'Sponsorship (corporate partnerships) careers revolve around selling deals and delivering measurable value for brands and rights-holders.',
    whatYouDo: [
      'Prospect, pitch, and close partnership deals (assets, pricing, terms).',
      'Build proposals that connect sponsor goals to audience and inventory.',
      'Measure and report partner ROI (impressions, conversions, brand lift).',
      'Coordinate activations across events, content, social, and in-venue.',
      'Renew and expand accounts through relationships and results.'
    ],
    salaryRange: {
      entry: '$50,000',
      mid: '$82,000',
      senior: '$165,000'
    },
    pathIn: {
      entryRoles: [
        'Partnership Sales Rep',
        'Sponsorship Coordinator'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Sales & negotiation',
        'Relationship building',
        'ROI analysis',
        'Knowledge of sponsor needs'
      ]
    },
    topCompanies: [
      'img',
      'excel-sports-management',
      'legends'
    ],
    relatedCareers: [
      'sports-marketing',
      'event-management',
      'sports-pr',
      'sports-licensing',
      'sports-media'
    ],
    dayInLife: 'You’ll spend mornings on outbound and pipeline work, afternoons on proposals and partner calls, and evenings at games/events for relationship-building and activations.',
    prosAndCons: {
      pros: [
        'Clear performance incentives and career mobility.',
        'Relationship-building plus real business impact.',
        'Exposure to brands, executives, and big moments.'
      ],
      cons: [
        'Sales pressure and quota reality.',
        'Activations can create long nights/weekends.',
        'Success depends on both pitch and delivery execution.'
      ]
    }
  },
  {
    id: 'team-operations',
    slug: 'team-operations',
    name: 'Team Operations',
    category: 'operations',
    tagline: 'Run the team behind the team.',
    description: 'Team operations roles manage the logistics, planning, and internal systems that keep a pro or college team running smoothly.',
    whatYouDo: [
      'Coordinate travel, schedules, and game-day logistics.',
      'Support player personnel processes (contracts, onboarding, compliance).',
      'Manage budgets, vendors, and operational workflows.',
      'Communicate across coaching, medical, and front office staff.',
      'Troubleshoot issues fast—your job is removing friction.'
    ],
    salaryRange: {
      entry: '$45,000',
      mid: '$120,000',
      senior: '$250,000+'
    },
    pathIn: {
      entryRoles: [
        'Team Operations Assistant',
        'Player Personnel Coordinator'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Sports management & logistics',
        'Budgeting',
        'Talent evaluation',
        'Leadership and organization'
      ]
    },
    topCompanies: [
      'new-york-yankees',
      'golden-state-warriors',
      'dallas-cowboys'
    ],
    relatedCareers: [
      'league-operations',
      'sports-analytics',
      'sports-finance',
      'venue-operations',
      'sports-law'
    ],
    dayInLife: 'You’re in constant coordination mode: confirming travel, resolving last-minute changes, handling vendors, and making sure the staff has what they need. On game days, you’re the calm operator making everything run.',
    prosAndCons: {
      pros: [
        'High trust role; you sit close to decision-makers.',
        'You learn how organizations *actually* run.',
        'Great foundation for front office leadership.'
      ],
      cons: [
        'Often behind-the-scenes with less public credit.',
        'Time demands track the competitive calendar.',
        'Can be stressful when things go wrong (because they will).'
      ]
    }
  },
  {
    id: 'league-operations',
    slug: 'league-operations',
    name: 'League Operations',
    category: 'operations',
    tagline: 'Set the rules, run the calendar, manage the ecosystem.',
    description: 'League operations roles sit at the governance layer—handling policies, compliance, scheduling, and cross-team coordination.',
    whatYouDo: [
      'Manage league policies, compliance programs, and competitive integrity.',
      'Coordinate with teams, broadcasters, sponsors, and venues on schedules.',
      'Run initiatives across committees and stakeholders.',
      'Support discipline, rule changes, and operational improvements.',
      'Plan and execute league events (draft, all-star, tournaments).'
    ],
    salaryRange: {
      entry: '$60,000',
      mid: '$200,000',
      senior: '$1,000,000+'
    },
    pathIn: {
      entryRoles: [
        'League Operations Coordinator',
        'Compliance Officer'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Governance & policy knowledge',
        'Project management',
        'Collaboration with stakeholders',
        'Strategic planning'
      ]
    },
    topCompanies: [
      'nfl',
      'nba',
      'ncaa'
    ],
    relatedCareers: [
      'team-operations',
      'sports-law',
      'sports-finance',
      'sports-consulting',
      'venue-operations'
    ],
    dayInLife: 'You’ll work across departments and teams, moving projects forward through alignment. Much of the job is stakeholder management—building consensus and executing with precision on big calendar moments.',
    prosAndCons: {
      pros: [
        'Broad view of the sport’s business and governance.',
        'High-leverage work that affects every team.',
        'Great stepping stone to senior exec roles.'
      ],
      cons: [
        'Slow decision-making; politics and stakeholder friction.',
        'Heavy process and policy work.',
        'Big peaks around major events and season milestones.'
      ]
    }
  },
  {
    id: 'sports-finance',
    slug: 'sports-finance',
    name: 'Sports Finance',
    category: 'business',
    tagline: 'Model the economics behind teams, leagues, and deals.',
    description: 'Sports finance roles cover budgeting, valuation, and strategic analysis—inside teams/leagues or in advisory firms working on sports assets.',
    whatYouDo: [
      'Build budgets, forecasts, and financial models for teams or projects.',
      'Analyze revenue streams (media rights, tickets, sponsorship, NIL).',
      'Support valuations, diligence, and investment memos for deals.',
      'Create board-ready reporting and KPIs for leadership.',
      'Partner with operations to improve margins and allocate resources.'
    ],
    salaryRange: {
      entry: '$60,000',
      mid: '$101,350',
      senior: '$200,000+'
    },
    pathIn: {
      entryRoles: [
        'Financial Analyst',
        'Accounting Associate'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Accounting & financial analysis',
        'Budgeting',
        'Strategic thinking',
        'Understanding of sports economics'
      ]
    },
    topCompanies: [
      'deloitte-sports',
      'goldman-sachs-sports',
      'oakview-group'
    ],
    relatedCareers: [
      'sports-pe',
      'sports-consulting',
      'league-operations',
      'team-operations',
      'sports-licensing'
    ],
    dayInLife: 'The day is split between model work and stakeholder meetings. You’ll update forecasts, answer questions from leadership, and prep materials for budget reviews, deal processes, or board conversations.',
    prosAndCons: {
      pros: [
        'Core business skillset with strong exit opportunities.',
        'You learn how sports economics actually work.',
        'High credibility with executives when you’re accurate and clear.'
      ],
      cons: [
        'Can be spreadsheet-heavy with long cycles.',
        'High stakes; mistakes are expensive.',
        'May require finance training that’s hard to pick up casually.'
      ]
    }
  },
  {
    id: 'sports-pe',
    slug: 'sports-pe',
    name: 'Sports Private Equity',
    category: 'business',
    tagline: 'Invest in sports assets and scale platforms.',
    description: 'Sports private equity focuses on sourcing, underwriting, and executing investments in teams, leagues, rights, and sports-adjacent businesses.',
    whatYouDo: [
      'Source and evaluate deals (market maps, outreach, thesis work).',
      'Build models and run valuation / scenario analysis.',
      'Support due diligence across legal, commercial, and operational workstreams.',
      'Draft investment memos and help negotiate terms.',
      'Work with portfolio companies on strategy and growth initiatives.'
    ],
    salaryRange: {
      entry: '$90,000',
      mid: '$177,000',
      senior: '$349,000'
    },
    pathIn: {
      entryRoles: [
        'Investment Analyst',
        'Private Equity Associate'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Financial modeling',
        'Deal sourcing & due diligence',
        'Valuation of sports assets',
        'Negotiation'
      ]
    },
    topCompanies: [
      'redbird-capital',
      'arctos-sports-partners',
      'silver-lake'
    ],
    relatedCareers: [
      'sports-finance',
      'sports-consulting',
      'sports-tech',
      'league-operations',
      'team-operations'
    ],
    dayInLife: 'You’ll move between research, modeling, and diligence. Some weeks are quiet and analytical; others are intense around live deals with fast turnarounds and lots of coordination.',
    prosAndCons: {
      pros: [
        'Exposure to top operators and high-value assets.',
        'Steep learning curve in strategy + finance.',
        'Prestige and strong career optionality.'
      ],
      cons: [
        'Demanding hours and high pressure.',
        'Access is competitive; recruiting is rigorous.',
        'Work can feel abstract if you prefer building vs underwriting.'
      ]
    }
  },
  {
    id: 'athlete-brand',
    slug: 'athlete-brand',
    name: 'Athlete Brand & NIL Management',
    category: 'talent',
    tagline: 'Build athlete businesses: NIL, partnerships, and long-term IP.',
    description: 'Athlete brand and NIL roles help athletes monetize and protect their brand—through partnerships, content strategy, and long-term business building.',
    whatYouDo: [
      'Develop brand strategy and positioning for athletes.',
      'Identify and negotiate partnership opportunities.',
      'Plan content calendars and campaign deliverables with creators/teams.',
      'Manage relationships with brands, agencies, and legal counsel.',
      'Track performance and report results to partners and the athlete.'
    ],
    salaryRange: {
      entry: '$50,000',
      mid: '$100,000',
      senior: '$300,000+'
    },
    pathIn: {
      entryRoles: [
        'Marketing Agent Assistant',
        'Brand Partnerships Coordinator'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Marketing & PR',
        'Social media strategy',
        'Contract & endorsement negotiation',
        'Client relationship management'
      ]
    },
    topCompanies: [
      'klutch-sports',
      'excel-sports-management',
      'vayner-sports'
    ],
    relatedCareers: [
      'sports-agent',
      'sports-marketing',
      'sports-pr',
      'sports-sponsorship',
      'sports-licensing'
    ],
    dayInLife: 'You’ll juggle partner communication, campaign planning, and creator execution. The work lives in calendars: deadlines, approvals, posting schedules, and brand deliverables—plus continuous relationship management.',
    prosAndCons: {
      pros: [
        'Close to athlete storytelling and culture.',
        'Clear outputs and measurable campaign results.',
        'Entrepreneurial role—great if you like building.'
      ],
      cons: [
        'Always-on responsiveness to athlete and brand needs.',
        'Hard boundaries; work spills into weekends.',
        'Results depend on content, performance, and brand fit.'
      ]
    }
  },
  {
    id: 'sports-tech',
    slug: 'sports-tech',
    name: 'Sports Tech Product Management',
    category: 'tech',
    tagline: 'Build products that power teams, fans, and sports commerce.',
    description: 'Sports tech roles build software and platforms across analytics, fan engagement, betting, commerce, and performance—often in product-led organizations.',
    whatYouDo: [
      'Define product requirements with users (teams, bettors, fans, operators).',
      'Work with engineers/design to ship features and improvements.',
      'Use data to prioritize roadmap and measure success.',
      'Coordinate go-to-market with marketing and partnerships.',
      'Handle tradeoffs: speed vs quality, usability vs complexity.'
    ],
    salaryRange: {
      entry: '$80,000',
      mid: '$158,842',
      senior: '$204,000'
    },
    pathIn: {
      entryRoles: [
        'Product Manager (Associate)',
        'Business Analyst (Sports Tech)'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Product development lifecycle',
        'Tech & UX knowledge',
        'Analytical thinking',
        'Collaboration with engineers'
      ]
    },
    topCompanies: [
      'fanatics',
      'draftkings',
      'catapult-sports'
    ],
    relatedCareers: [
      'sports-analytics',
      'sports-betting',
      'sports-media',
      'sports-finance',
      'esports'
    ],
    dayInLife: 'You’ll start with standups and metrics review, then spend time writing specs, aligning stakeholders, and unblocking engineering. You’ll ship, measure, and iterate continuously.',
    prosAndCons: {
      pros: [
        'High demand skill set; strong compensation bands.',
        'Portfolio-friendly work (products, features, case studies).',
        'Transferable beyond sports into broader tech roles.'
      ],
      cons: [
        'Requires comfort with ambiguity and tradeoffs.',
        'You’ll need to earn trust with technical teams.',
        'User needs can be fragmented (teams vs fans vs leagues).'
      ]
    }
  },
  {
    id: 'sports-betting',
    slug: 'sports-betting',
    name: 'Sports Betting Operations',
    category: 'tech',
    tagline: 'Operate sportsbooks and manage risk in real time.',
    description: 'Sports betting operations roles run pricing, risk, and compliance for sportsbooks—balancing sharp modeling with fast operational execution.',
    whatYouDo: [
      'Monitor markets and adjust odds based on information and action.',
      'Manage risk exposure and trading strategies.',
      'Work with compliance teams on regulations and controls.',
      'Analyze customer behavior, promos, and product performance.',
      'Coordinate incident response for live events and integrity issues.'
    ],
    salaryRange: {
      entry: '$51,670',
      mid: '$85,580',
      senior: '$165,220'
    },
    pathIn: {
      entryRoles: [
        'Sportsbook Analyst',
        'Trading (Odds) Associate'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Sports wagering knowledge',
        'Data analytics',
        'Regulatory compliance',
        'Risk management'
      ]
    },
    topCompanies: [
      'fanduel',
      'mgm-resorts',
      'caesars-entertainment'
    ],
    relatedCareers: [
      'sports-tech',
      'sports-analytics',
      'sports-finance',
      'league-operations',
      'sports-law'
    ],
    dayInLife: 'The day can be calm until it’s not. You’ll spend time reviewing exposure and performance, then shift into live monitoring as games start—making quick, high-stakes decisions with incomplete info.',
    prosAndCons: {
      pros: [
        'Fast-paced with immediate feedback loops.',
        'Data-driven and competitive environment.',
        'Growing industry with many adjacent roles.'
      ],
      cons: [
        'Odd hours aligned with live sports.',
        'Regulatory complexity varies by state/market.',
        'High-pressure decisions in real time.'
      ]
    }
  },
  {
    id: 'esports',
    slug: 'esports',
    name: 'Esports Business Management',
    category: 'tech',
    tagline: 'Operate teams, leagues, and brands in gaming culture.',
    description: 'Esports business roles run partnerships, events, community, and team operations in a fast-moving ecosystem shaped by platforms and fandom.',
    whatYouDo: [
      'Manage team or league operations, scheduling, and logistics.',
      'Build sponsorship deals and create activations that fit gaming culture.',
      'Run community, content, and creator programs.',
      'Plan tournaments and live/online events.',
      'Track audience and monetization performance across platforms.'
    ],
    salaryRange: {
      entry: '$40,000',
      mid: '$77,180',
      senior: '$150,000'
    },
    pathIn: {
      entryRoles: [
        'Esports Team Manager',
        'Community Manager'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Gaming industry knowledge',
        'Event production',
        'Digital marketing',
        'Sponsorship & media rights'
      ]
    },
    topCompanies: [
      'riot-games',
      'team-liquid',
      'faze-clan'
    ],
    relatedCareers: [
      'sports-media',
      'sports-marketing',
      'event-management',
      'sports-sponsorship',
      'sports-tech'
    ],
    dayInLife: 'You’ll bounce between partnership work, content/community operations, and event planning. The rhythm is defined by tournaments, drops, and platform trends.',
    prosAndCons: {
      pros: [
        'Highly digital-native industry; strong creator/community overlap.',
        'Lots of room for experimentation and new formats.',
        'Great fit if you understand gaming culture.'
      ],
      cons: [
        'Business models can be unstable or changing.',
        'Platform dependency is high.',
        'Roles can be broad with unclear career ladders.'
      ]
    }
  },
  {
    id: 'sports-law',
    slug: 'sports-law',
    name: 'Sports Law',
    category: 'business',
    tagline: 'Protect interests through contracts, compliance, and disputes.',
    description: 'Sports lawyers work on contracts, labor issues, compliance, disputes, and governance—supporting teams, leagues, agencies, and athletes.',
    whatYouDo: [
      'Draft and review contracts (player, sponsorship, media, licensing).',
      'Advise on labor rules, CBAs, and compliance requirements.',
      'Support negotiations, arbitrations, and dispute resolution.',
      'Manage risk around IP, employment law, and regulatory issues.',
      'Translate complex legal issues into business decisions.'
    ],
    salaryRange: {
      entry: '$101,610',
      mid: '$151,160',
      senior: '$300,000+'
    },
    pathIn: {
      entryRoles: [
        'Junior Attorney (Sports Practice)',
        'Legal Counsel, Team/League'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Juris Doctor & bar admission',
        'Contract & labor law expertise',
        'Negotiation skills',
        'Ethical judgement'
      ]
    },
    topCompanies: [
      'proskauer-rose',
      'orrick-herrington',
      'nflpa'
    ],
    relatedCareers: [
      'sports-agent',
      'league-operations',
      'team-operations',
      'sports-finance',
      'sports-licensing'
    ],
    dayInLife: 'You’ll spend time reviewing documents, advising stakeholders, and supporting negotiations. Peaks happen around deals, disputes, and high-visibility incidents.',
    prosAndCons: {
      pros: [
        'High leverage and strong compensation ceiling.',
        'You develop expertise that travels across sports and business.',
        'You sit in the room when major decisions happen.'
      ],
      cons: [
        'Requires JD and bar path; long time investment.',
        'Work can be document-heavy and detail-intensive.',
        'High stakes; mistakes can be costly.'
      ]
    }
  },
  {
    id: 'venue-operations',
    slug: 'venue-operations',
    name: 'Venue Operations',
    category: 'operations',
    tagline: 'Run arenas, stadiums, and live events like a machine.',
    description: 'Venue operations roles oversee facilities, staffing, safety, and vendor coordination to deliver great fan experiences and efficient events.',
    whatYouDo: [
      'Coordinate event-day operations across security, staffing, and vendors.',
      'Manage facility maintenance and capital improvement planning.',
      'Oversee guest services and experience standards.',
      'Coordinate with teams, promoters, and production partners.',
      'Run post-event debriefs and implement operational improvements.'
    ],
    salaryRange: {
      entry: '$78,130',
      mid: '$102,340',
      senior: '$133,990'
    },
    pathIn: {
      entryRoles: [
        'Venue Operations Coordinator',
        'Event Operations Assistant'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Facility management',
        'Event logistics',
        'Staff supervision',
        'Safety and compliance'
      ]
    },
    topCompanies: [
      'asm-global',
      'aeg-worldwide',
      'msg-sports'
    ],
    relatedCareers: [
      'event-management',
      'team-operations',
      'league-operations',
      'sports-sponsorship',
      'sports-pr'
    ],
    dayInLife: 'Event days are everything: early setup, constant monitoring, and quick problem-solving. Non-event days are planning, vendor management, and maintenance work that prevents chaos later.',
    prosAndCons: {
      pros: [
        'Tangible work with clear outcomes (events delivered well).',
        'Leadership opportunities with large teams.',
        'Transferable ops skill set across entertainment.'
      ],
      cons: [
        'Nights/weekends are common.',
        'High responsibility for safety and experience.',
        'Can be stressful when issues cascade live.'
      ]
    }
  },
  {
    id: 'sports-pr',
    slug: 'sports-pr',
    name: 'Sports PR & Communications',
    category: 'media',
    tagline: 'Shape narratives and manage reputations under pressure.',
    description: 'Sports PR roles manage communications for teams, leagues, brands, and athletes—handling media relations, messaging, and crisis response.',
    whatYouDo: [
      'Write press releases, statements, and internal messaging.',
      'Build relationships with reporters and media partners.',
      'Prepare executives/athletes for interviews and media moments.',
      'Manage crisis comms and rapid response.',
      'Coordinate announcements (signings, partnerships, initiatives).'
    ],
    salaryRange: {
      entry: '$48,000',
      mid: '$69,780',
      senior: '$132,870'
    },
    pathIn: {
      entryRoles: [
        'Communications Assistant',
        'Public Relations Coordinator'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Press release writing',
        'Media relations',
        'Crisis communication',
        'Storytelling'
      ]
    },
    topCompanies: [
      'edelman-sports',
      'laforce',
      'league-communications-office'
    ],
    relatedCareers: [
      'sports-marketing',
      'sports-media',
      'sports-sponsorship',
      'team-operations',
      'athlete-brand'
    ],
    dayInLife: 'You’ll monitor news cycles, respond to inbound media, draft messaging, and coordinate approvals. During crises or big announcements, everything speeds up and precision matters.',
    prosAndCons: {
      pros: [
        'You develop strong writing and stakeholder management skills.',
        'High visibility work; you’re close to leadership.',
        'Great foundation for brand and comms leadership.'
      ],
      cons: [
        'Always on-call for breaking news.',
        'Approvals and politics can slow good messaging.',
        'High stress during crises.'
      ]
    }
  },
  {
    id: 'event-management',
    slug: 'event-management',
    name: 'Event & Live Experience',
    category: 'operations',
    tagline: 'Design and execute live sports experiences people remember.',
    description: 'Event management roles plan and run tournaments, fan festivals, brand activations, and live experiences—moving from concept to execution.',
    whatYouDo: [
      'Plan logistics, budgets, timelines, and staffing for events.',
      'Coordinate vendors, venues, and production teams.',
      'Run on-site operations and troubleshoot in real time.',
      'Manage stakeholder expectations (sponsors, teams, media).',
      'Measure event outcomes and improve the playbook.'
    ],
    salaryRange: {
      entry: '$35,990',
      mid: '$59,440',
      senior: '$101,310'
    },
    pathIn: {
      entryRoles: [
        'Event Coordinator',
        'Fan Experience Associate'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Event planning',
        'Vendor management',
        'Fan engagement creativity',
        'Project management'
      ]
    },
    topCompanies: [
      'img',
      'live-nation',
      'formula-1'
    ],
    relatedCareers: [
      'venue-operations',
      'sports-sponsorship',
      'sports-marketing',
      'esports',
      'sports-pr'
    ],
    dayInLife: 'Most of the work is planning and coordination until event week—then it becomes a long, on-your-feet execution sprint with rapid problem-solving and constant communication.',
    prosAndCons: {
      pros: [
        'Clear deliverables and high energy work.',
        'Great for builders and operators.',
        'Strong network effects—events connect you with everyone.'
      ],
      cons: [
        'Physically demanding; long days during event windows.',
        'Lots of moving parts; mistakes are visible.',
        'Can be hard to maintain work-life balance in peak seasons.'
      ]
    }
  },
  {
    id: 'sports-consulting',
    slug: 'sports-consulting',
    name: 'Sports Consulting',
    category: 'business',
    tagline: 'Solve strategic problems for teams, leagues, and brands.',
    description: 'Sports consulting roles advise clients on strategy, growth, pricing, sponsorship, media, and operations—often through analytics-heavy projects.',
    whatYouDo: [
      'Structure ambiguous problems into a workplan and hypotheses.',
      'Build analyses and models (market sizing, pricing, ROI, scenarios).',
      'Interview stakeholders and synthesize qualitative insights.',
      'Create decks and recommendations for executives.',
      'Support implementation with tracking and change management.'
    ],
    salaryRange: {
      entry: '$74,540',
      mid: '$99,410',
      senior: '$130,800'
    },
    pathIn: {
      entryRoles: [
        'Analyst (Sports Consulting)',
        'Consultant (Junior)'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Strategic analysis',
        'Client communication',
        'Data-driven decision making',
        'Industry research'
      ]
    },
    topCompanies: [
      'deloitte-sports',
      'mckinsey-sports',
      'sports-innovation-lab'
    ],
    relatedCareers: [
      'sports-finance',
      'sports-analytics',
      'sports-pe',
      'sports-marketing',
      'league-operations'
    ],
    dayInLife: 'You’ll alternate between analysis blocks and client meetings. The core loop: define the question, analyze fast, build a clean story in slides, then iterate based on feedback.',
    prosAndCons: {
      pros: [
        'Fast learning across many parts of the industry.',
        'Strong skill development (structured thinking, storytelling).',
        'Brand-name firms can open doors.'
      ],
      cons: [
        'Heavy presentation cycles and revisions.',
        'Travel/late nights can happen.',
        'Work can feel removed from day-to-day execution.'
      ]
    }
  },
  {
    id: 'sports-licensing',
    slug: 'sports-licensing',
    name: 'Licensing & Merchandising',
    category: 'business',
    tagline: 'Turn teams, leagues, and athletes into products fans buy.',
    description: 'Sports licensing and merchandising roles manage IP, product strategy, and retail partnerships—connecting fandom to commerce.',
    whatYouDo: [
      'Manage licensing relationships and approvals for IP usage.',
      'Work with product teams on assortment and drops.',
      'Coordinate with retail/ecommerce partners on launches.',
      'Track sales performance and inventory signals.',
      'Ensure brand standards and legal compliance for products.'
    ],
    salaryRange: {
      entry: '$105,340',
      mid: '$121,760',
      senior: '$140,730'
    },
    pathIn: {
      entryRoles: [
        'Licensing Coordinator',
        'Merchandising Analyst'
      ],
      timeline: 'Build fundamentals + portfolio, then specialize and grow scope over 2–5 years.',
      requiredSkills: [
        'Brand licensing knowledge',
        'Supply chain & logistics',
        'Marketing and sales',
        'Negotiation and contracts'
      ]
    },
    topCompanies: [
      'fanatics',
      'nike',
      'adidas'
    ],
    relatedCareers: [
      'sports-marketing',
      'sports-sponsorship',
      'sports-finance',
      'athlete-brand',
      'sports-tech'
    ],
    dayInLife: 'You’ll review product calendars, approve designs, coordinate with partners, and watch performance. Big moments are around launches, playoffs, and major collaborations.',
    prosAndCons: {
      pros: [
        'Direct link to revenue and fan identity.',
        'Fun mix of brand, product, and partnerships.',
        'Clear portfolio outputs (collections, launches).'
      ],
      cons: [
        'Approvals and stakeholder loops can be slow.',
        'Supply chain and inventory issues can create fire drills.',
        'Work peaks around seasonal calendars and big events.'
      ]
    }
  }
]
