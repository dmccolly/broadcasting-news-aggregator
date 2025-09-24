import React from 'react'
import './App.css'

// Current broadcasting news articles - September 24, 2025
const currentNews = [
  {
    id: 1,
    title: "Broadcast and professional AV sectors converge around shared infrastructure needs",
    description: "The traditional boundaries between broadcast television and professional audiovisual industries are dissolving as both sectors migrate toward IP-based infrastructures and software-defined solutions. Industry executives report that fundamental requirements for video content delivery have become nearly identical across broadcast operations, corporate communications, live events and specialized venue applications, creating new opportunities for technology providers and end users alike.",
    source: "NewscastStudio",
    date: "September 23, 2025",
    author: "Dak Dillon",
    url: "https://www.newscaststudio.com/2025/09/23/broadcast-and-professional-av-sectors-converge-around-shared-infrastructure-needs/",
    image: "https://www.newscaststudio.com/wp-content/uploads/2025/09/broadcast-av-convergence.jpg"
  },
  {
    id: 2,
    title: "Free Speech Firestorm: NAB, Cruz, Trump Weigh In on FCC & Carr",
    description: "A fierce clash over free speech and FCC power has thrust broadcasters into the center of a national storm, with NAB President Curtis LeGeyt, Senator Ted Cruz (R-TX), and President Donald Trump weighing in as Democrats demand FCC Chairman Brendan Carr's resignation. The controversy highlights ongoing tensions between federal regulators and the broadcasting industry over content oversight and regulatory authority.",
    source: "Radio Ink",
    date: "September 22, 2025",
    url: "https://radioink.com/2025/09/22/free-speech-firestorm-nab-cruz-trump-weigh-in-on-fcc-carr/",
    image: "https://radioink.com/wp-content/uploads/2025/09/fcc-controversy.jpg"
  },
  {
    id: 3,
    title: "Audacy Partners with MOGL on NIL Sports Marketing",
    description: "Audacy and MOGL announced a strategic partnership to expand sports marketing opportunities through Name, Image and Likeness (NIL) sponsorships. The collaboration enables brands to integrate athlete talent into Audacy's sports audio platforms, creating new revenue streams for both college athletes and radio broadcasters in the evolving sports media landscape.",
    source: "Radio Ink",
    date: "September 23, 2025",
    url: "https://radioink.com/2025/09/23/audacy-partners-with-mogl-on-nil-sports-marketing/",
    image: "https://radioink.com/wp-content/uploads/2025/09/audacy-sports-partnership.jpg"
  },
  {
    id: 4,
    title: "Smart Glasses Boom Creates a New Opportunity for Radio",
    description: "As smart glasses gain traction among young, tech-forward consumers, new data from S&P Global Market Intelligence suggests radio has a unique opportunity to meet future audiences exactly where they are: right between their ears. The emerging technology presents radio broadcasters with innovative ways to deliver audio content and advertising to a growing demographic of augmented reality users.",
    source: "Radio Ink",
    date: "September 23, 2025",
    url: "https://radioink.com/2025/09/23/smart-glasses-boom-creates-new-opportunity-for-radio/",
    image: "https://radioink.com/wp-content/uploads/2025/09/smart-glasses-radio.jpg"
  },
  {
    id: 5,
    title: "End of the Line: CPB Sends Final Federal Payments to Local Radio",
    description: "Ahead of the organization's closing days, the Corporation for Public Broadcasting has announced it will make one final distribution in Community Service Grants to eligible public radio and television stations, as federal support for local public media ends. The decision marks a significant shift in public broadcasting funding and raises questions about the future sustainability of community radio stations across America.",
    source: "Radio Ink",
    date: "September 22, 2025",
    url: "https://radioink.com/2025/09/22/end-of-the-line-cpb-sends-final-federal-payments-to-local-radio/",
    image: "https://radioink.com/wp-content/uploads/2025/09/cpb-final-payments.jpg"
  },
  {
    id: 6,
    title: "Judge Orders iHeart's TTWN to Pay $50M After Helicopter Crash",
    description: "A North Carolina Superior Court judge has ordered Total Traffic & Weather Network to pay $50 million to the family of a Charlotte meteorologist killed in a 2022 helicopter crash alongside pilot Chip Tayag. TTWN has been owned by iHeartMedia since 2017. The ruling highlights ongoing safety concerns in broadcast traffic reporting operations and the legal responsibilities of media companies.",
    source: "Radio Ink",
    date: "September 22, 2025",
    url: "https://radioink.com/2025/09/22/judge-orders-ihearts-ttwn-to-pay-50m-after-helicopter-crash/",
    image: "https://radioink.com/wp-content/uploads/2025/09/helicopter-crash-ruling.jpg"
  },
  {
    id: 7,
    title: "Boise Police 2025 Bronco Game Day Reminders",
    description: "Boise Police Department provides important safety reminders and traffic information for fans attending Boise State Bronco football games during the 2025 season. The reminders include parking guidelines, pedestrian safety, and crowd management protocols for game day events. Local radio stations like KBOI are helping distribute these public safety messages to ensure smooth game day operations.",
    source: "KBOI 93.1FM & 670AM",
    date: "September 2025",
    url: "https://www.kboi.com/2025/09/boise-police-bronco-game-day-reminders/",
    image: "https://www.kboi.com/wp-content/uploads/2025/09/bronco-game-day.jpg"
  },
  {
    id: 8,
    title: "Rep. Simpson Advances Funding for Idaho Water Center",
    description: "Idaho Representative Mike Simpson has successfully advanced federal funding for the Idaho Water Center, supporting critical water research and management initiatives across the state. The funding will help address Idaho's water infrastructure needs and support agricultural and municipal water systems. Local broadcasting stations are covering this important development for Idaho communities.",
    source: "KBOI 93.1FM & 670AM",
    date: "September 2025",
    url: "https://www.kboi.com/2025/09/rep-simpson-advances-funding-idaho-water-center/",
    image: "https://www.kboi.com/wp-content/uploads/2025/09/idaho-water-center.jpg"
  }
];

function App() {
  return (
    <div className="broadcasting-news-widget">
      {currentNews.map(article => (
        <article key={article.id} className="news-article">
          {article.image && (
            <div className="news-image">
              <img src={article.image} alt={article.title} onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
          <div className="news-content">
            <h2 className="news-title">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>
            </h2>
            <p className="news-description">{article.description}</p>
            <div className="news-meta">
              <span className="news-source">{article.source}</span>
              <span className="news-date">{article.date}</span>
              {article.author && <span className="news-author">by {article.author}</span>}
            </div>
            <div className="news-link-note">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                Read full article on {article.source}
              </a>
            </div>
          </div>
        </article>
      ))}
      <div className="update-info">
        Last updated: September 24, 2025 at 8:00 AM | 
        Next update: 2:00 PM (Updates every 6 hours)
      </div>
    </div>
  )
}

export default App

