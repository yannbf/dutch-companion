import { ExternalLink, Youtube, Music, Gamepad2, Tv } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ResourceItem {
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
}

const Resources = () => {
  const youtubeChannels: ResourceItem[] = [
    {
      title: "NOS Journaal in Makkelijke Taal",
      description: "News in easy language by NOS - quick videos where they speak very clearly, focused on people learning Dutch",
      url: "https://www.youtube.com/@NOSJournaalinMakkelijkeTaal",
      thumbnail: "https://i.regiogroei.cloud/084ab956-388a-37d7-8d97-be740384a09b.jpg?width=552&height=310&aspect_ratio=552:310&cb=c8c0923dd76a337585e836c30efb60b3",
    },
    {
      title: "Jeugdjournaal",
      description: "Youth news by NOS - quick videos about news in a more digestible way for young people",
      url: "https://www.youtube.com/@jeugdjournaal",
      thumbnail: "https://kinderpodcasts.nl/wp-content/uploads/2021/05/NOS-Jeugdjournaal.jpg",
    },
    {
      title: "Dutch Soap Opera by Bart de Pau",
      description: "Great way to learn Dutch with a lightweight soap opera where each episode focuses on teaching something in Dutch",
      url: "https://www.youtube.com/playlist?list=PLUOa-qvvZolCoiF8CuqCyVU9tG2v8cjE6",
      thumbnail: "https://static.lingq.com/media/resources/collections/images/2019/02/12/5d91c78e49_eaNxUYA.png",
    },
    {
      title: "Lubach Official",
      description: "Lubach night show - a satirical magazine about ongoing news in the Netherlands",
      url: "https://www.youtube.com/@Lubach_official",
      thumbnail: "https://image.volkskrant.nl/250133735/feature-crop/1200/1200/arjen-lubach-stapt-van-de-vpro-over-naar-rtl-zijn-programma",
    },
  ];

  const musicResources: ResourceItem[] = [
    {
      title: "Dutch Songs Playlist",
      description: "A curated Spotify playlist with songs in Dutch to help you learn through music",
      url: "https://open.spotify.com/playlist/1H7oBMOE5TFT4XmEg0GsoG?si=qDMDa7wtQHq-dEw5aoiSfA&pi=3BXQyi2aSZeox",
    },
  ];

  const games: ResourceItem[] = [
    {
      title: "Woordle.nl",
      description: "Daily word to guess in Dutch - similar to Wordle but specifically for learning Dutch vocabulary",
      url: "https://woordle.nl/",
      thumbnail: "https://www.solitaireparadise.com/static/game-images/wordle-350x300.png",
    },
  ];

  const tvShows: ResourceItem[] = [
    {
      title: "Amsterdam Empire",
      description: "Netflix series about a crime drama set in Amsterdam",
      url: "https://www.netflix.com/title/81654735",
      thumbnail: "https://m.media-amazon.com/images/M/MV5BYWQ0ZTMyNTctYjkyZS00NmE4LWFiZTItYzkzZWY1ZmJhNjA5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    },
    {
      title: "Haantjes",
      description: "Comedy series about four men in midlife crisis",
      url: "https://www.netflix.com/title/81698659",
      thumbnail: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQo4WDOWwAa7xVKiCfPK1HR7kHs15H4Rf2WW06z8xZIpdHwiZFV",
    },
  ];

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Resources</h1>
          <p className="text-muted-foreground">
            Helpful resources to keep practicing Dutch in your day-to-day life
          </p>
        </div>

        {/* Music Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5 text-green-500" />
              Music
            </CardTitle>
            <CardDescription>
              Learn Dutch through music and rhythm
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {musicResources.map((music, index) => (
              <div key={index}>
                {/* <div
                  className="p-4 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer mb-4"
                  onClick={() => openLink(music.url)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {music.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {music.description}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </div>
                 */}
                {/* Spotify Embed */}
                <div className="rounded-lg overflow-hidden border border-border">
                  <iframe
                    style={{ borderRadius: '12px' }}
                    src="https://open.spotify.com/embed/playlist/1H7oBMOE5TFT4XmEg0GsoG?utm_source=generator&theme=0"
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title="Dutch Songs Playlist"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* YouTube Channels Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              YouTube Channels
            </CardTitle>
            <CardDescription>
              Watch and learn Dutch through engaging video content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {youtubeChannels.map((channel, index) => (
              <div
                key={index}
                className="p-4 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => openLink(channel.url)}
              >
                <div className="flex items-start gap-4">
                  {channel.thumbnail && (
                    <img
                      src={channel.thumbnail}
                      alt={channel.title}
                      className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {channel.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {channel.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Games Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-purple-500" />
              Games
            </CardTitle>
            <CardDescription>
              Practice Dutch vocabulary through fun games
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {games.map((game, index) => (
              <div
                key={index}
                className="p-4 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => openLink(game.url)}
              >
                <div className="flex items-start gap-4">
                  {game.thumbnail && (
                    <img
                      src={game.thumbnail}
                      alt={game.title}
                      className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {game.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {game.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* TV Shows Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-blue-500" />
              TV Shows
            </CardTitle>
            <CardDescription>
              Immerse yourself in Dutch through series and shows
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tvShows.map((show, index) => (
              <div
                key={index}
                className="p-4 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => openLink(show.url)}
              >
                <div className="flex items-start gap-4">
                  {show.thumbnail && (
                    <img
                      src={show.thumbnail}
                      alt={show.title}
                      className="w-24 h-36 object-cover rounded-md flex-shrink-0"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {show.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {show.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Resources;

