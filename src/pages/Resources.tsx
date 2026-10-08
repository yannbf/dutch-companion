import { useState } from "react";
import { ExternalLink, Youtube, Music, Gamepad2, Tv } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ResourceItem {
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
}

type TvGenre = "Comedy" | "Drama" | "Crime" | "Thriller" | "Reality" | "Documentary";

interface TvShow {
  title: string;
  description: string;
  genre: TvGenre;
  platform: { name: string; url: string };
  thumbnail: string;
}

const tvGenres: TvGenre[] = ["Comedy", "Drama", "Crime", "Thriller", "Reality", "Documentary"];

const Resources = () => {
  const [genreFilter, setGenreFilter] = useState<TvGenre | "All">("All");

  const youtubeChannels: ResourceItem[] = [
    {
      title: "NOS Journaal in Makkelijke Taal",
      description: "News in easy language by NOS - quick videos where they speak very clearly, focused on people learning Dutch",
      url: "https://www.youtube.com/@NOSJournaalinMakkelijkeTaal",
      thumbnail: "https://yt3.googleusercontent.com/5q2w8xXC-y1yV_-xL3bMVxnTi4AB_RPQE4_hmE3Y8unRmqK8nRmTszCwfKUEBtcsGMvv3kCXJ3Q=s900-c-k-c0x00ffffff-no-rj",
    },
    {
      title: "Jeugdjournaal",
      description: "Youth news by NOS - quick videos about news in a more digestible way for young people",
      url: "https://www.youtube.com/@jeugdjournaal",
      thumbnail: "https://yt3.googleusercontent.com/ytc/AIdro_mKulIeB5oP4rqIAXumJN5iyHYGsaR7qLfcwTOjv54fo_A=s900-c-k-c0x00ffffff-no-rj",
    },
    {
      title: "Dutch Soap Opera by Bart de Pau",
      description: "Great way to learn Dutch with a lightweight soap opera where each episode focuses on teaching something in Dutch",
      url: "https://www.youtube.com/playlist?list=PLUOa-qvvZolCoiF8CuqCyVU9tG2v8cjE6",
      thumbnail: "https://i.ytimg.com/vi/RX6HtRwh_tk/hqdefault.jpg",
    },
    {
      title: "Lubach Official",
      description: "Lubach night show - a satirical magazine about ongoing news in the Netherlands",
      url: "https://www.youtube.com/@Lubach_official",
      thumbnail: "https://yt3.googleusercontent.com/6NHEqPPXYkYbzDI0SN8HdSSIvQaJfI2rdfr_wFHWjPx0XFJFMZjS0tcTXaaJeyfxilNTWNUzXQ=s900-c-k-c0x00ffffff-no-rj",
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
      thumbnail: "https://woordle.nl/images/woordle_og_1200x630.png",
    },
  ];

  const tvShows: TvShow[] = [
    {
      title: "Amsterdam Empire",
      description: "Crime drama set in Amsterdam's coffeeshop world",
      genre: "Crime",
      platform: { name: "Netflix", url: "https://www.netflix.com/title/81654735" },
      thumbnail: "https://occ-0-6144-769.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABV4C42NTDKC_sMnBKnbJNf95LUN0AEwZ9kpjbKrkmE6mbX2Emy1bVpekTRh4izaHmJmaLHyuJapsXHoZQ5JvnNlwgZrsBXvzX0Qj.webp?r=338",
    },
    {
      title: "Haantjes",
      description: "Four middle-aged friends in a masculinity crisis",
      genre: "Comedy",
      platform: { name: "Netflix", url: "https://www.netflix.com/title/81698659" },
      thumbnail: "https://occ-0-6144-769.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABfMrfmCUBXc2QD0sWtlmhMHCAgHgY99A5N_bPbzrAzV1rpJ7KtUl1TWwJP4iR-Gh35hYkBZUwSIZZrzlXkOj8SuDeeF8WoGSGr36.webp?r=3f8",
    },
    {
      title: "Voetbalouders",
      description: "A single mum meets the overbearing parents of her son's new football team",
      genre: "Comedy",
      platform: { name: "Netflix", url: "https://www.netflix.com/title/81628960" },
      thumbnail: "https://occ-0-6144-769.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABaA-NbKVPCjVyQYXnueiBjxyhnTe2zYVYthpSMsjHR-1sMHs26XSldrHtWEntB3Nu9NyyWWa5kVL3vZ99h-AHZdREDFedtwdC4p_.webp?r=960",
    },
    {
      title: "Dirty Lines",
      description: "1980s Amsterdam: a student takes a job at an erotic phone-line start-up (mature)",
      genre: "Drama",
      platform: { name: "Netflix", url: "https://www.netflix.com/title/81149112" },
      thumbnail: "https://occ-0-6144-769.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABcRiw88sPQl7tdixoTjoyI1kp4niARNdPMmaBKp72qoJahR0ul0UajZLQ8OZhheZTCBbNXYkRyJ-me1-FEnNLXA_GFdFxCjQpiba.webp?r=0bb",
    },
    {
      title: "De Eetclub",
      description: "A villa fire exposes the secrets of a wealthy friend group in Bergen; from Saskia Noort's novel",
      genre: "Thriller",
      platform: { name: "Netflix", url: "https://www.netflix.com/title/81662912" },
      thumbnail: "https://occ-0-6144-769.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABYZix79mlafaJlEfr98rGqEAOiDje70vN9-reRYINdiNBk3CEjshCUxajDlvxwhLqOCToGi3aBblROQsj5-cpjyLrOKU0fb_heKB.webp?r=059",
    },
    {
      title: "Oogappels",
      description: "Award-winning drama about four families in a Dutch town; natural everyday dialogue",
      genre: "Drama",
      platform: { name: "NPO Start", url: "https://npo.nl/start/serie/oogappels" },
      thumbnail: "https://assets-start.npo.nl/resources/2025/09/22/f5f5ee7b-14da-453c-957e-9e0e37983fab.jpg?dimensions=1200x630&resize_fit_method=cover",
    },
    {
      title: "De Luizenmoeder",
      description: "A new mum at a primary school clashes with the other parents; school-gate Dutch",
      genre: "Comedy",
      platform: { name: "NPO Start", url: "https://npo.nl/start/serie/de-luizenmoeder" },
      thumbnail: "https://assets-start.npo.nl/resources/2026/05/15/1eccea6a-d51c-4bcd-9e84-abafc8e67737.jpg?dimensions=1200x630&resize_fit_method=cover",
    },
    {
      title: "Penoza",
      description: "A mother takes over her murdered husband's criminal empire",
      genre: "Crime",
      platform: { name: "NPO Start", url: "https://npo.nl/start/serie/penoza" },
      thumbnail: "https://assets-start.npo.nl/resources/2024/05/29/e19eab12-93d0-4dfc-aea2-f827dd1a516d.jpg?dimensions=1200x630&resize_fit_method=cover",
    },
    {
      title: "Het verhaal van Nederland",
      description: "Docudrama on Dutch history with clear, slow narration (The Story of the Netherlands)",
      genre: "Documentary",
      platform: { name: "NPO Start", url: "https://npo.nl/start/serie/het-verhaal-van-nederland" },
      thumbnail: "https://assets-start.npo.nl/resources/2023/09/27/bc13d655-ae7e-43ba-800b-556e7b065ab1.jpg?dimensions=1200x630&resize_fit_method=cover",
    },
    {
      title: "Vakkenvullers",
      description: "Teens working at a supermarket; youth slang and everyday Dutch",
      genre: "Comedy",
      platform: { name: "NPO Start", url: "https://npo.nl/start/serie/vakkenvullers" },
      thumbnail: "https://assets-start.npo.nl/resources/2026/09/29/72c18533-5a94-4600-b114-939af53ffb7a.jpg?dimensions=1200x630&resize_fit_method=cover",
    },
    {
      title: "Máxima",
      description: "Máxima Zorreguieta's road to becoming queen",
      genre: "Drama",
      platform: { name: "Videoland", url: "https://www.videoland.com/nl/maxima/" },
      thumbnail: "https://prodstrapicmswesubscribe.blob.core.windows.net/uploads/assets/Maxima_S2_Maxima_en_Willem_Alexander_500x500_8e49a17d19.webp",
    },
    {
      title: "Kopen Zonder Kijken",
      description: "Couples let a team buy and renovate a house they only see afterwards; housing vocabulary",
      genre: "Reality",
      platform: { name: "Videoland", url: "https://v2.videoland.com/kopen-zonder-kijken-p_133" },
      thumbnail: "https://images-fio.videoland.bedrock.tech/v2/images/470662/raw",
    },
    {
      title: "Amsterdam Centraal 24/7",
      description: "Docuseries on a day and night at Amsterdam Centraal station; real everyday speech",
      genre: "Documentary",
      platform: { name: "Disney+", url: "https://www.disneyplus.com/nl-nl/browse/entity-2c9e28f7-c47d-45cc-9ba8-3f0117928a5c" },
      thumbnail: "https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/019d5fe4-238f-74bf-b622-16919e6780dd/compose?aspectRatio=1.78&format=webp&width=1200",
    },
    {
      title: "Bon Bini: Judeska in da House",
      description: "Film: Judeska gets stuck in a minister's villa during lockdown",
      genre: "Comedy",
      platform: { name: "Prime Video", url: "https://www.primevideo.com/detail/amzn1.dv.gti.f180f0b1-c8ef-4f4b-9e5f-4ea19433edbb" },
      thumbnail: "https://m.media-amazon.com/images/S/pv-target-images/a1b67c0b512a7e786a6ad15e0aa36ab416b0b90696d27ea46016548242a32ed5.jpg",
    },
  ];

  const visibleShows = genreFilter === "All" ? tvShows : tvShows.filter((show) => show.genre === genreFilter);

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
              Series and films by platform. NPO Start is free with a Dutch account; the others need a subscription.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(["All", ...tvGenres] as const).map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setGenreFilter(genre)}
                  aria-pressed={genreFilter === genre}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    genreFilter === genre
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground hover:bg-secondary/30"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            {visibleShows.map((show) => (
              <div
                key={show.title}
                data-testid="tv-show-card"
                className="p-4 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => openLink(show.platform.url)}
              >
                <div className="flex items-start gap-4">
                  {show.thumbnail && (
                    <img
                      src={show.thumbnail}
                      alt={show.title}
                      className="w-28 sm:w-32 aspect-video object-cover rounded-md flex-shrink-0"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1">{show.title}</h3>
                    <p className="text-sm text-muted-foreground">{show.description}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <Badge variant="secondary">{show.genre}</Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {show.platform.name}
                        <ExternalLink className="w-3 h-3" />
                      </span>
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

