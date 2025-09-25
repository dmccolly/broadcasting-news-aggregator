import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { ExternalLink, Radio, Calendar, Trophy, Users } from 'lucide-react'
import './App.css'

function App() {
  const [radioContent, setRadioContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Mock data for Boise radio stations content
  const getRadioContent = () => {
    return [
      {
        id: 1,
        station: "KTSY 89.5",
        stationName: "Christian CHR",
        type: "event",
        title: "MercyMe LIVE 2025",
        description: "Contemporary Christian music superstars MercyMe bring their powerful live performance to Boise. Known for hits like 'I Can Only Imagine' and 'Even If,' this concert promises an unforgettable evening of worship and music.",
        date: "November 2, 2025",
        link: "https://ktsy.org/events-community/upcoming-events/",
        image: null,
        priority: "high"
      },
      {
        id: 2,
        station: "Wild 101.1",
        stationName: "Hip Hop",
        type: "contest",
        title: "Listen to Win $500 Every Weekday",
        description: "Tune in weekdays for your chance to win $500 cash! Listen for the cue to call and be caller 10 to win. No purchase necessary, must be 18 or older to participate.",
        date: "Ongoing",
        link: "https://wild101fm.com/contests/",
        image: null,
        priority: "high"
      },
      {
        id: 3,
        station: "KBOI 670",
        stationName: "News/Talk",
        type: "event",
        title: "Bert Kreischer Live",
        description: "Comedian Bert Kreischer brings his hilarious stand-up comedy to Boise. Known for his storytelling and high-energy performances, this show is part of his national tour.",
        date: "October 4, 2025",
        link: "https://www.kboi.com/",
        image: null,
        priority: "medium"
      },
      {
        id: 4,
        station: "104.3 Wow Country",
        stationName: "Country",
        type: "contest",
        title: "Win Cash Promotions",
        description: "Multiple chances to win cash prizes throughout the week. Listen for details and your chance to win big with Boise's country music leader.",
        date: "Weekly",
        link: "https://1043wowcountry.com/",
        image: null,
        priority: "medium"
      },
      {
        id: 5,
        station: "107.9 Lite FM",
        stationName: "Adult Contemporary",
        type: "event",
        title: "Sandler Under the Stars",
        description: "Free screening of The Wedding Singer at Terrace Drive-In to celebrate Adam Sandler's upcoming Ford Idaho Center show. Win tickets to his live performance!",
        date: "October 5, 2025",
        link: "https://liteonline.com/",
        image: null,
        priority: "high"
      },
      {
        id: 6,
        station: "105.1 Jack FM",
        stationName: "Adult Hits",
        type: "event",
        title: "City of Meridian Oktoberfest",
        description: "Join Jack FM at Meridian's annual Oktoberfest celebration featuring German food, beer, music, and family-friendly activities in downtown Meridian.",
        date: "October 4, 2025",
        link: "https://www.jackboise.com/",
        image: null,
        priority: "medium"
      },
      {
        id: 7,
        station: "KTSY 89.5",
        stationName: "Christian CHR",
        type: "contest",
        title: "I Love My Church Giveaway",
        description: "$20,000 in production gear giveaway for local churches. Help your church win professional audio and video equipment to enhance worship services.",
        date: "Ends October 31, 2025",
        link: "https://ktsy.org/",
        image: null,
        priority: "high"
      },
      {
        id: 8,
        station: "Wild 101.1",
        stationName: "Hip Hop",
        type: "event",
        title: "Wicked & Wild Bash",
        description: "Halloween party featuring live DJs, costume contests, and prizes. Boise's hottest Halloween event with music from today's biggest hip hop and pop artists.",
        date: "October 30, 2025",
        link: "https://wild101fm.com/",
        image: null,
        priority: "medium"
      },
      {
        id: 9,
        station: "KBOI 670",
        stationName: "News/Talk",
        type: "contest",
        title: "$5K a Day Contest",
        description: "Listen daily for your chance to win $5,000 cash. Multiple chances to win throughout the day during Kasper & Chris and other popular shows.",
        date: "Daily",
        link: "https://www.kboi.com/",
        image: null,
        priority: "high"
      },
      {
        id: 10,
        station: "91.5 KBSX",
        stationName: "Public Radio",
        type: "community",
        title: "Idaho Community Calendar",
        description: "Your source for local events, community meetings, and public affairs programming. Featuring in-depth coverage of Idaho politics and local issues.",
        date: "Daily",
        link: "https://www.boisestatepublicradio.org/",
        image: null,
        priority: "low"
      },
      {
        id: 11,
        station: "105.1 Jack FM",
        stationName: "Adult Hits",
        type: "contest",
        title: "Jack Words 2025",
        description: "Play Jack Words for your chance to win $500! Listen for the daily word and text it in for your chance to win cash prizes.",
        date: "Ongoing",
        link: "https://www.jackboise.com/",
        image: null,
        priority: "medium"
      },
      {
        id: 12,
        station: "107.9 Lite FM",
        stationName: "Adult Contemporary",
        type: "contest",
        title: "$1000 a Day At Work Payday",
        description: "Win $1000 while you're at work! Listen for the cue to call during work hours for your chance to win big with Lite FM.",
        date: "Weekdays",
        link: "https://liteonline.com/",
        image: null,
        priority: "high"
      }
    ]
  }

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setRadioContent(getRadioContent())
      setLoading(false)
    }, 1000)
  }, [])

  const getTypeIcon = (type) => {
    switch (type) {
      case 'contest':
        return <Trophy className="h-4 w-4" />
      case 'event':
        return <Calendar className="h-4 w-4" />
      case 'community':
        return <Users className="h-4 w-4" />
      default:
        return <Radio className="h-4 w-4" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'contest':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'event':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'community':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Radio className="h-12 w-12 animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading Boise radio content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Radio className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Boise Radio Hub</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">
            Your source for local radio events, contests, and community content
          </p>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {radioContent.filter(item => item.type === 'contest').length}
              </p>
              <p className="text-sm text-gray-600">Active Contests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {radioContent.filter(item => item.type === 'event').length}
              </p>
              <p className="text-sm text-gray-600">Upcoming Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {radioContent.filter(item => item.type === 'community').length}
              </p>
              <p className="text-sm text-gray-600">Community Programs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Radio className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">15</p>
              <p className="text-sm text-gray-600">Radio Stations</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {radioContent.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {item.station}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getTypeColor(item.type)}`}>
                        <span className="flex items-center gap-1">
                          {getTypeIcon(item.type)}
                          {item.type}
                        </span>
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mb-1">{item.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {item.stationName} • {item.date}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  {item.description}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open(item.link, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Station Website
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Boise Radio Hub aggregates content from the top 15 Nielsen-ranked radio stations in the Boise market.
            <br />
            Content is updated daily to bring you the latest events, contests, and community programming.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
