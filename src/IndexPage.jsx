import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Radio, Newspaper, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'

function IndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Broadcasting & Radio Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your comprehensive source for broadcasting industry news and local Boise radio content
          </p>
        </div>

        {/* Feed Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Broadcasting News Feed */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Newspaper className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Broadcasting Industry News</CardTitle>
              <CardDescription className="text-base">
                Latest news from major broadcasting trade publications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Sources Include:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Radio Ink</li>
                  <li>• Inside Radio</li>
                  <li>• TV News Check</li>
                  <li>• Radio World</li>
                  <li>• Broadcasting & Cable</li>
                  <li>• RBR-TVBR</li>
                  <li>• Inside Audio Marketing</li>
                </ul>
              </div>
              
              <div className="space-y-3 pt-4">
                <Link to="/broadcasting">
                  <Button className="w-full" size="lg">
                    <Newspaper className="h-4 w-4 mr-2" />
                    View Broadcasting News
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => window.open(window.location.origin + '/broadcasting', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Local Radio Feed */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Radio className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Boise Radio Hub</CardTitle>
              <CardDescription className="text-base">
                Local events, contests, and community content from Boise radio stations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Features:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Top 15 Nielsen-ranked stations</li>
                  <li>• Live contests and giveaways</li>
                  <li>• Upcoming events and concerts</li>
                  <li>• Community programming</li>
                  <li>• Station personality content</li>
                </ul>
              </div>
              
              <div className="space-y-3 pt-4">
                <Link to="/radio">
                  <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                    <Radio className="h-4 w-4 mr-2" />
                    View Radio Hub
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => window.open(window.location.origin + '/radio', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Embed Information */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-xl">Embed These Feeds</CardTitle>
              <CardDescription>
                Use these URLs to embed the feeds in your website or application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-left space-y-2">
                <h4 className="font-semibold">Broadcasting News Feed:</h4>
                <code className="block p-2 bg-gray-100 rounded text-sm break-all">
                  {window.location.origin}/broadcasting
                </code>
              </div>
              <div className="text-left space-y-2">
                <h4 className="font-semibold">Boise Radio Hub:</h4>
                <code className="block p-2 bg-gray-100 rounded text-sm break-all">
                  {window.location.origin}/radio
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default IndexPage
