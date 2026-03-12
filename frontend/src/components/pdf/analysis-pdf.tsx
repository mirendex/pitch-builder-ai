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
    section: {
      marginBottom: 14,
    },
    profileGrid: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
    },
    profileItem: {
      width: "50%",
      paddingRight: 12,
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 9,
      letterSpacing: 2,
      textTransform: "uppercase",
      color: "#8d3f1d",
      marginBottom: 8,
    },
    blockCard: {
      backgroundColor: "#fffaf2",
      borderWidth: 1,
      borderColor: "#ead9c6",
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
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
      marginBottom: 10,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#efe4d4",
    },
    itemBoxLast: {
      borderBottomWidth: 0,
      paddingBottom: 0,
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
    stepRow: {
      display: "flex",
      flexDirection: "row",
      marginBottom: 8,
    },
    stepIndex: {
      width: 18,
      color: "#8d3f1d",
      fontWeight: 700,
    },
    stepText: {
      flex: 1,
      lineHeight: 1.45,
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client profile</Text>
          <View style={styles.blockCard} wrap={false}>
            <View style={styles.profileGrid}>
              <View style={styles.profileItem}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{analysis.client_profile.name || "Unknown"}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.label}>Company</Text>
                <Text style={styles.value}>{analysis.client_profile.company || "Unknown"}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.label}>Role</Text>
                <Text style={styles.value}>{analysis.client_profile.role || "Unknown"}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.label}>Industry</Text>
                <Text style={styles.value}>{analysis.client_profile.industry || "Unknown"}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive summary</Text>
          <View style={styles.blockCard} wrap={false}>
            <Text style={styles.value}>{analysis.executive_summary}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pain points</Text>
          {analysis.pain_points.length === 0 ? (
            <View style={styles.blockCard} wrap={false}>
              <Text style={styles.value}>No pain points captured.</Text>
            </View>
          ) : null}
          {analysis.pain_points.map((point, index) => (
            <View
              key={`${point.title}-${index}`}
              style={styles.blockCard}
              wrap={false}
            >
              <Text style={styles.itemTitle}>{point.title}</Text>
              <Text style={styles.value}>{point.description}</Text>
              <Text style={styles.itemMeta}>Severity: {point.severity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proposed solutions</Text>
          {analysis.proposed_solutions.length === 0 ? (
            <View style={styles.blockCard} wrap={false}>
              <Text style={styles.value}>No solutions captured.</Text>
            </View>
          ) : null}
          {analysis.proposed_solutions.map((solution, index) => (
            <View
              key={`${solution.title}-${index}`}
              style={styles.blockCard}
              wrap={false}
            >
              <Text style={styles.itemTitle}>{solution.title}</Text>
              <Text style={styles.value}>{solution.description}</Text>
              <Text style={styles.itemMeta}>
                Links: {solution.linked_pain_points.join(", ") || "Not mapped"}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next steps</Text>
          {analysis.next_steps.length === 0 ? (
            <View style={styles.blockCard} wrap={false}>
              <Text style={styles.value}>No next steps captured.</Text>
            </View>
          ) : null}
          {analysis.next_steps.map((step, index) => (
            <View key={`${step}-${index}`} style={styles.blockCard} wrap={false}>
              <View style={styles.stepRow}>
                <Text style={styles.stepIndex}>{index + 1}.</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key metrics</Text>
          {analysis.key_metrics.length === 0 ? (
            <View style={styles.blockCard} wrap={false}>
              <Text style={styles.value}>No key metrics captured.</Text>
            </View>
          ) : null}
          {analysis.key_metrics.map((metric, index) => (
            <View
              key={`${metric.label}-${index}`}
              style={styles.blockCard}
              wrap={false}
            >
              <Text style={styles.label}>{metric.label}</Text>
              <Text style={styles.itemTitle}>{metric.value}</Text>
            </View>
          ))}
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
