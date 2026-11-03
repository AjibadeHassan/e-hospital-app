'use client'

import { useRouterStore } from '@/store/router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import {
  Stethoscope,
  Calendar,
  FileText,
  Bell,
  Activity,
  ShieldCheck,
  Users,
  ArrowRight,
  Clock,
  Heart,
  Sparkles,
} from 'lucide-react'

export default function LandingView() {
  const { navigate } = useRouterStore()

  const features = [
    { icon: Calendar, title: 'Smart Appointments', description: 'Book, reschedule, and manage appointments with real-time availability.' },
    { icon: FileText, title: 'Medical Records', description: 'Secure access to your complete medical history, lab results, and imaging.' },
    { icon: Activity, title: 'Prescriptions', description: 'Track active medications, request refills, and view dosage instructions.' },
    { icon: Bell, title: 'Real-time Notifications', description: 'Stay informed with appointment reminders and health updates.' },
    { icon: ShieldCheck, title: 'Secure & Verified', description: 'Role-based access for patients, doctors, nurses, and pharmacists.' },
    { icon: Users, title: 'Multi-Role Dashboard', description: 'Personalized experience for every healthcare team member.' },
  ]

  const stats = [
    { value: '10k+', label: 'Active Patients' },
    { value: '500+', label: 'Doctors' },
    { value: '50k+', label: 'Appointments' },
    { value: '24/7', label: 'Support' },
  ]

  return (
    <div className="flex-1">
      {/* Hero Section — with background image + glassmorphism */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hospital-bg.jpg"
            alt="Medical facility"
            className="h-full w-full object-cover"
          />
          {/* Dark gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-teal-950/70 to-slate-950/80" />
          {/* Subtle animated glow */}
          <motion.div
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"
          />
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-sm font-medium text-white"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Trusted by 10,000+ patients
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold tracking-tight text-white"
            >
              Your Health,{' '}
              <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                Connected
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-white/80"
            >
              A comprehensive healthcare management system bringing patients, doctors,
              and care teams together in one secure platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Button
                size="lg"
                onClick={() => navigate('register')}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-base h-12 px-8 border-0 shadow-lg shadow-emerald-500/30"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('login')}
                className="w-full sm:w-auto text-base h-12 px-8 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                Sign In
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-4 text-sm text-white/60"
            >
              Demo accounts available — try it instantly with pre-loaded data
            </motion.p>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50"
        >
          <div className="h-10 w-6 rounded-full border-2 border-white/30 flex items-start justify-center p-1.5">
            <div className="h-2 w-1 rounded-full bg-white/50" />
          </div>
        </motion.div>
      </section>

      {/* Stats — glassmorphism cards over gradient */}
      <section className="relative -mt-px bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm text-emerald-100 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — animated cards with hover effects */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-emerald-50/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center mb-12"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3 w-3" />
              FEATURES
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need for better care
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful tools designed to streamline healthcare for everyone
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white transition-transform group-hover:scale-110">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA — gradient with floating elements */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        {/* Floating decorative elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 left-10 text-white/10"
        >
          <Heart className="h-24 w-24" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-10 right-10 text-white/10"
        >
          <Stethoscope className="h-32 w-32" />
        </motion.div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Stethoscope className="mx-auto h-12 w-12 mb-4 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to take control of your health?
            </h2>
            <p className="text-lg text-emerald-50 mb-8 max-w-2xl mx-auto">
              Join E-Hospital today and experience healthcare management reimagined.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => navigate('register')}
                className="w-full sm:w-auto bg-white text-emerald-700 hover:bg-emerald-50 text-base h-12 px-8"
              >
                Create Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('login')}
                className="w-full sm:w-auto border-white text-white hover:bg-white/10 hover:text-white text-base h-12 px-8"
              >
                <Clock className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
