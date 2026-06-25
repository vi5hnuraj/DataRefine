"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Upload,
  TrendingUp,
  Eye,
  Download,
  Check,
  Star,
  Users,
  Clock
} from "lucide-react";
import Header from "@/components/header";
import { Dropzone } from "@/components/upload/dropzone";
import { useState } from "react";

const features = [
  {
    icon: Upload,
    title: "Upload Any Dataset",
    description: "Support CSV, Excel and JSON files.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "Data Validation",
    description: "Detect missing values, invalid dates, invalid numbers and schema mismatches.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Eye,
    title: "Data Cleaning",
    description: "Remove duplicates, empty rows and standardize values.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Download,
    title: "Analytics & Reporting",
    description: "Generate statistics, quality reports and processed exports.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const useCases = [
  {
    title: "CSV Processing",
    description: "Process large CSV datasets automatically.",
    image: "📊",
    tags: ["CSV", "Data"],
  },
  {
    title: "Excel ETL",
    description: "Upload and transform Excel spreadsheets.",
    image: "📁",
    tags: ["Excel", "ETL"],
  },
  {
    title: "Data Analytics",
    description: "Generate insights and statistics from datasets.",
    image: "📈",
    tags: ["Analytics", "Statistics"],
  },
  {
    title: "Data Cleaning",
    description: "Remove duplicates and fix invalid records.",
    image: "🧹",
    tags: ["Cleaning", "Validation"],
  },
  {
    title: "Data Quality Reports",
    description: "View validation reports and error summaries.",
    image: "📑",
    tags: ["Quality", "Reports"],
  },
  {
    title: "Serverless Processing",
    description: "Run ETL workloads without managing servers.",
    image: "☁️",
    tags: ["Serverless", "Scale"],
  },
];

const stats = [
  { value: "10K+", label: "Datasets Processed" },
  { value: "50M+", label: "Records Cleaned" },
  { value: "< 5s", label: "Average ETL Time" },
  { value: "99.9%", label: "Uptime" },
];

const systemFeatures = [
  "Event Driven Processing",
  "Data Validation Engine",
  "Automated Cleaning",
  "Statistical Analysis",
  "Dataset History Tracking",
  "Processed File Export"
];

const supportedDatasets = [
  { title: "Student Marks Dataset", description: "Process and validate grades." },
  { title: "Sales Dataset", description: "Process sales and revenue data." },
  { title: "Financial Dataset", description: "Analyze financial records." },
  { title: "HR Dataset", description: "Clean HR and employee datasets." },
  { title: "E-Commerce Dataset", description: "Validate e-commerce logs." },
  { title: "IoT Sensor Dataset", description: "Transform sensor telemetry." },
];

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleUploadClick = () => {
    if (session) {
      setIsUploadOpen(true);
    } else {
      router.push("/signin");
    }
  };

  return (
    <div className="relative flex grow flex-col min-h-screen">
      <div className="isolate flex h-full grow flex-col">
        <Header onUploadClick={handleUploadClick} />

        {/* Hero Section */}
        <section className="relative px-4 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm px-4 py-2 text-sm mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-muted-foreground">100% Serverless Event-Driven Architecture</span>
              </motion.div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground mb-6">
                Process Data at Scale with
                <br />
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Serverless ETL
                </span>
              </h1>

              <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-10">
                Upload CSV, Excel, or JSON datasets and automatically perform validation, cleaning, transformation, analytics, and reporting through a scalable event-driven pipeline.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleUploadClick}
                  className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Upload Dataset
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-50 group-hover:opacity-70 transition-opacity -z-10" />
                </button>
                <Link
                  href="/history"
                  className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm px-8 py-4 text-lg font-semibold text-foreground hover:bg-card transition-colors"
                >
                  View Dataset History
                </Link>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-16 lg:mt-24"
            >
              <div className="relative mx-auto max-w-5xl">
                {/* Dashboard Preview Mock */}
                <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md shadow-2xl overflow-hidden">
                  {/* Browser Header */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="mx-auto max-w-md h-6 rounded-md bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">
                        datarefine.app/etl
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Content Preview */}
                  <div className="p-6 lg:p-8">
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      {[
                        { label: "Total Datasets Processed", value: "2,450", change: "+12.5%", color: "blue" },
                        { label: "Total Records Processed", value: "14.2M", change: "+8.2%", color: "purple" },
                        { label: "Validation Errors Found", value: "12,420", change: "-2.1%", color: "emerald" },
                        { label: "Data Quality Reports Generated", value: "2,450", change: "+5.7%", color: "orange" },
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="rounded-xl border border-border/50 bg-card p-4"
                        >
                          <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                          <p className="text-xl font-bold text-foreground">{stat.value}</p>
                          <p className={`text-xs text-${stat.color}-500`}>{stat.change}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Chart Placeholder */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 rounded-xl border border-border/50 bg-card p-4 h-48">
                        <p className="text-sm font-medium text-foreground mb-4">Processing Throughput</p>
                        <div className="flex items-end justify-between h-32 gap-2">
                          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                            <motion.div
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
                              className="flex-1 rounded-t bg-gradient-to-t from-blue-600 to-purple-500"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-border/50 bg-card p-4 h-48">
                        <p className="text-sm font-medium text-foreground mb-4">Error Distribution</p>
                        <div className="flex items-center justify-center h-32">
                          <div className="relative w-28 h-28">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="40" fill="none" strokeWidth="12" className="stroke-muted-foreground/20" />
                              <motion.circle
                                cx="50" cy="50" r="40" fill="none" strokeWidth="12"
                                strokeDasharray="251.2"
                                initial={{ strokeDashoffset: 251.2 }}
                                animate={{ strokeDashoffset: 62.8 }}
                                transition={{ delay: 1, duration: 1 }}
                                className="stroke-blue-500"
                              />
                              <motion.circle
                                cx="50" cy="50" r="40" fill="none" strokeWidth="12"
                                strokeDasharray="251.2"
                                initial={{ strokeDashoffset: 251.2 }}
                                animate={{ strokeDashoffset: 125.6 }}
                                transition={{ delay: 1.2, duration: 1 }}
                                className="stroke-purple-500"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="absolute -left-4 top-1/4 rounded-xl border border-border/50 bg-card/90 backdrop-blur-sm p-3 shadow-lg hidden lg:block"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Data uploaded</p>
                      <p className="text-xs text-muted-foreground">sales_2024.csv</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 }}
                  className="absolute -right-4 top-1/3 rounded-xl border border-border/50 bg-card/90 backdrop-blur-sm p-3 shadow-lg hidden lg:block"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">ETL Completed</p>
                      <p className="text-xs text-muted-foreground">Processed in 1.2s</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-y border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground mt-2">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-4">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Everything you need to
                <br />
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  process datasets
                </span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="py-24 px-4 bg-card/30 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Built for every
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"> use case</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((useCase, i) => (
                <motion.div
                  key={useCase.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 hover:bg-card transition-all duration-300 hover:shadow-xl"
                >
                  <div className="text-5xl mb-4">{useCase.image}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground mb-4">{useCase.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {useCase.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 px-4">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Process datasets in
                <span className="bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent"> 3 simple steps</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Upload Dataset",
                  description: "Upload CSV, Excel or JSON files.",
                  icon: "💬",
                },
                {
                  step: "02",
                  title: "Run ETL Pipeline",
                  description: "Extract → Validate → Clean → Transform → Analyze",
                  icon: "📊",
                },
                {
                  step: "03",
                  title: "View Results",
                  description: "Review statistics, reports and processed datasets.",
                  icon: "✨",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="text-7xl font-bold text-muted/30 mb-4">{item.step}</div>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>

                  {i < 2 && (
                    <div className="hidden md:block absolute top-12 right-0 translate-x-1/2">
                      <ArrowRight className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* System Features Section */}
        <section className="py-24 px-4 bg-card/30 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                System
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> Features</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemFeatures.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-foreground">{feature}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Supported Dataset Types Section */}
        <section className="py-24 px-4">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Supported
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"> Dataset Types</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supportedDatasets.map((prompt, i) => (
                <motion.div
                  key={prompt.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <button
                    onClick={handleUploadClick}
                    className="block w-full text-left group rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 hover:bg-card hover:border-blue-500/50 transition-all duration-300"
                  >
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-blue-500 transition-colors">
                      {prompt.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {prompt.description}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-sm text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Try this dataset <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-4">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-3xl border border-border/50 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm p-12 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                  Ready to Process Your Dataset?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Upload a dataset and automatically generate clean, structured, analytics-ready data.
                </p>
                <button
                  onClick={handleUploadClick}
                  className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Start Processing
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <Link href="/" className="inline-block mb-4">
                  <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    DataRefine
                  </span>
                </Link>
                <p className="text-muted-foreground max-w-sm">
                  Serverless ETL and Data Processing Platform that transforms your data into beautiful,
                  interactive visualizations in seconds.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><button onClick={handleUploadClick} className="text-muted-foreground hover:text-foreground transition-colors text-left w-full">Process Data</button></li>
                  <li><Link href="#use-cases" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                  <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                </ul>
              </div>

            </div>
            <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} DataRefine. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Upload Modal Overlay */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsUploadOpen(false)}
              className="absolute -top-4 -right-4 w-8 h-8 flex items-center justify-center rounded-full bg-muted border border-border/50 hover:bg-muted-foreground/20 text-muted-foreground transition-colors z-10"
            >
              ✕
            </button>
            <Dropzone />
          </div>
        </div>
      )}
    </div>
  );
}

// Using Node.js runtime instead of Edge to avoid size limits (Edge limit is 1MB)
export const runtime = "nodejs";
