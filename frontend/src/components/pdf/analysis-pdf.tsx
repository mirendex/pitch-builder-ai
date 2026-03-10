"use client";

import type { AnalysisResult } from "@/lib/analysis-types";

export async function downloadAnalysisPdf(analysis: AnalysisResult, analysisId: string) {
  const { Document, Page, StyleSheet, Text, View, pdf } = await import("@react-pdf/renderer");

  const styles = StyleSheet.create({
    page: {
      padding: 36,
      backgroundColor: "#f8f1e7",
      color: "#1f1f1a",
      fontSize: 11,
      fontFamily: "Helvetica",
    },
    header: {
      marginBottom: 20,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#d8c7b1",
    },
    eyebrow: {
      fontSize: 9,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: "#8d3f1d",
      marginBottom: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: 700,
      marginBottom: 4,
    },
    subtitle: {
      color: "#786c5d",
      lineHeight: 1.5,
    },
    grid: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    card: {
      width: "48%",
      backgroundColor: "#fffaf2",
      borderWidth: 1,
      borderColor: "#ead9c6",
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
    },
    cardFull: {
      width: "100%",
    },
    cardTitle: {
      fontSize: 9,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: "#8d3f1d",
      marginBottom: 10,
    },
    label: {
      fontSize: 9,
      textTransform: "uppercase",
      color: "#786c5d",
      marginBottom: 4,
    },
    value: {
      marginBottom: 8,
      lineHeight: 1.45,
    },
    itemBox: {
      marginBottom: 8,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#efe4d4",
    },
    itemTitle: {
      fontWeight: 700,
      marginBottom: 4,
    },
    itemMeta: {
      color: "#786c5d",
      fontSize: 9,
      marginTop: 4,
    },
  });

  const pdfDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Pitch Builder AI</Text>
          <Text style={styles.title}>Sales intelligence brief</Text>
          <Text style={styles.subtitle}>Analysis ID: {analysisId}</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Client profile</Text>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{analysis.client_profile.name || "Unknown"}</Text>
            <Text style={styles.label}>Company</Text>
            <Text style={styles.value}>{analysis.client_profile.company || "Unknown"}</Text>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{analysis.client_profile.role || "Unknown"}</Text>
            <Text style={styles.label}>Industry</Text>
            <Text style={styles.value}>{analysis.client_profile.industry || "Unknown"}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Executive summary</Text>
            <Text style={styles.value}>{analysis.executive_summary}</Text>
          </View>

          <View style={[styles.card, styles.cardFull]}>
            <Text style={styles.cardTitle}>Pain points</Text>
            {analysis.pain_points.map((point, index) => (
              <View key={`${point.title}-${index}`} style={styles.itemBox}>
                <Text style={styles.itemTitle}>{point.title}</Text>
                <Text>{point.description}</Text>
                <Text style={styles.itemMeta}>Severity: {point.severity}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.card, styles.cardFull]}>
            <Text style={styles.cardTitle}>Proposed solutions</Text>
            {analysis.proposed_solutions.map((solution, index) => (
              <View key={`${solution.title}-${index}`} style={styles.itemBox}>
                <Text style={styles.itemTitle}>{solution.title}</Text>
                <Text>{solution.description}</Text>
                <Text style={styles.itemMeta}>
                  Links: {solution.linked_pain_points.join(", ") || "Not mapped"}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Next steps</Text>
            {analysis.next_steps.map((step, index) => (
              <Text key={`${step}-${index}`} style={styles.value}>
                {index + 1}. {step}
              </Text>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Key metrics</Text>
            {analysis.key_metrics.map((metric, index) => (
              <View key={`${metric.label}-${index}`} style={styles.itemBox}>
                <Text style={styles.label}>{metric.label}</Text>
                <Text style={styles.itemTitle}>{metric.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );

  const blob = await pdf(pdfDocument).toBlob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `sales-brief-${analysisId}.pdf`;
  link.click();
  URL.revokeObjectURL(blobUrl);
}
