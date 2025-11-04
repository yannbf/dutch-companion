import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { PlayCircle, BarChart2, TrendingUp, RotateCcw, Filter } from "lucide-react"
import { reviewTracker } from "@/lib/reviewTracker"
import { vocabularyData } from "@/data/vocabulary"
import { exerciseStats } from "@/lib/exerciseStats"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AppHeader } from "@/components/AppHeader"

const VocabularyStats = () => {
  const navigate = useNavigate()

  const counts = reviewTracker.getCountsByChapter()
  const [showOnlyWrong, setShowOnlyWrong] = useState(true)

  const totalToReview = useMemo(() => reviewTracker.getAllWords().length, [])

  const chapterIdToInfo = useMemo(() => {
    const map: Record<string, { title: string; number: number; wordsCount: number }> = {}
    for (const c of vocabularyData) {
      map[c.id] = { title: c.title, number: Number(c.chapter), wordsCount: c.words.length }
    }
    return map
  }, [])

  const stats = exerciseStats.get('vocabulary')
  const overallSeen = Object.values(stats.seenWordsByChapter || {}).reduce((acc, arr) => acc + arr.length, 0)
  const overallWrong = Math.max(0, overallSeen - stats.correctAttempts)

  const visibleCounts = showOnlyWrong ? counts : vocabularyData.map(c => ({ chapterId: c.id, count: counts.find(x => x.chapterId === c.id)?.count || 0 }))

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader
        title="Statistics"
        fixed
      />

      <div className="max-w-2xl mx-auto space-y-6 px-4 pt-6">
        <p className="text-muted-foreground text-center">Your learning progress and statistics</p>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{overallSeen}</div>
                <div className="text-sm text-muted-foreground">Words practiced</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{overallWrong}</div>
                <div className="text-sm text-muted-foreground">Words mistakes</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{overallSeen > 0 ? Math.round(((overallSeen - overallWrong) / overallSeen) * 100) : 0}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <Label htmlFor="wrong-words-toggle" className="text-sm">Show only chapters with wrong words</Label>
              </div>
              <Switch id="wrong-words-toggle" checked={showOnlyWrong} onCheckedChange={setShowOnlyWrong} />
            </div>
          </CardContent>
        </Card> */}

        {visibleCounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Chapter Progress</CardTitle>
              <CardDescription>Your performance in each chapter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {visibleCounts.map(({ chapterId, count }) => {
                const chapter = vocabularyData.find(c => c.id === chapterId)
                if (!chapter) return null
                const cStats = stats.chapterStats[chapterId] || { totalAttempts: 0, correctAttempts: 0 }
                const seen = (stats.seenWordsByChapter?.[chapterId] || []).length
                const wrong = Math.max(0, seen - cStats.correctAttempts)
                const chapterAccuracy = seen > 0 ? Math.round(((seen - wrong) / seen) * 100) : 0
                const badgeVariant = chapterAccuracy >= 80 ? "default" : chapterAccuracy >= 60 ? "secondary" : "destructive"
                return (
                  <div key={chapterId} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Chapter {chapter.chapter} ({chapter.title})</h4>
                        <p className="text-sm text-muted-foreground">{seen - wrong}/{seen} correct</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={badgeVariant}>{chapterAccuracy}%</Badge>
                        {count > 0 && (
                          <Button size="sm" variant="outline" onClick={() => navigate(`/exercises/vocabulary?reviewChapter=${encodeURIComponent(chapterId)}`)}>
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                    <Progress value={chapterAccuracy} className="h-2" />
                    {count > 0 && (
                      <div className="text-sm text-muted-foreground">{count} Words to review: {reviewTracker.getWordsForChapter(chapterId).join(", ")}</div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {totalToReview > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Review All Mistakes
              </CardTitle>
              <CardDescription>Practice at once all {totalToReview} words you got wrong across all chapters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Button onClick={() => navigate(`/exercises/vocabulary?review=all`)}>Review all mistakes</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default VocabularyStats


