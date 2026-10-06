'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouterStore } from '@/store/router'
import api from '@/lib/api'
import {
  Stethoscope,
  Loader2,
  AlertTriangle,
  CalendarPlus,
  CheckCircle2,
  Activity,
  Clock,
  AlertCircle,
} from 'lucide-react'

interface TriageResult {
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency'
  suggestedDepartment: string
  reasoning: string
  recommendedDoctors: { id: string; name: string; specialization: string }[]
  disclaimer: string
}

const urgencyConfig = {
  emergency: {
    label: 'Emergency',
    color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800',
    icon: AlertTriangle,
    message: 'Seek immediate medical attention or call emergency services now.',
  },
  urgent: {
    label: 'Urgent',
    color: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800',
    icon: Clock,
    message: 'You should be seen within 24-48 hours. Book an appointment soon.',
  },
  soon: {
    label: 'Soon',
    color: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
    icon: Clock,
    message: 'Book an appointment within the next week.',
  },
  routine: {
    label: 'Routine',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
    icon: CheckCircle2,
    message: 'This can be addressed at your convenience.',
  },
}

export function TriageAssistant() {
  const { navigate } = useRouterStore()
  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TriageResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!symptoms.trim() || loading) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const data = await api.post<TriageResult>('/triage', { symptoms })
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const config = result ? urgencyConfig[result.urgency] : null

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">AI Symptom Triage</CardTitle>
            <CardDescription className="text-xs">
              Describe your symptoms — get a department & doctor recommendation
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="symptoms" className="text-sm">What symptoms are you experiencing?</Label>
            <Textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., I've had a persistent headache for 3 days with sensitivity to light..."
              rows={3}
              disabled={loading}
              className="resize-none"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !symptoms.trim()}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing symptoms...
              </>
            ) : (
              <>
                <Activity className="mr-2 h-4 w-4" />
                Get Recommendation
              </>
            )}
          </Button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {result && config && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 pt-2"
            >
              {/* Urgency badge */}
              <div className={`flex items-center gap-2 rounded-lg border p-3 ${config.color}`}>
                <config.icon className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{config.label}</p>
                  <p className="text-xs">{config.message}</p>
                </div>
              </div>

              {/* Emergency warning */}
              {result.urgency === 'emergency' && (
                <Alert className="border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 dark:text-red-400 font-medium">
                    This sounds like it could be an emergency. Please call emergency services immediately or go to the nearest emergency room. Do not wait for an appointment.
                  </AlertDescription>
                </Alert>
              )}

              {/* Department suggestion */}
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Suggested Department</p>
                <p className="text-sm font-semibold">{result.suggestedDepartment}</p>
              </div>

              {/* Reasoning */}
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Reasoning</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.reasoning}</p>
              </div>

              {/* Recommended doctors */}
              {result.recommendedDoctors && result.recommendedDoctors.length > 0 && (
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Recommended Doctors</p>
                  <div className="space-y-2">
                    {result.recommendedDoctors.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.specialization}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('appointments-book')}
                          className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                        >
                          <CalendarPlus className="mr-1 h-3 w-3" />
                          Book
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground italic border-t pt-2">
                {result.disclaimer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
