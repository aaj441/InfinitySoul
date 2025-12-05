// Minimal OpenTelemetry setup (optional). Initializes SDK if exporter endpoint is configured.
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

export async function initTracing() {
  try {
    const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    if (!endpoint) return; // opt-in only

    // Avoid heavy SDK if not needed; dynamically import to keep startup fast
    const { NodeSDK } = await import("@opentelemetry/sdk-node");
    const { OTLPTraceExporter } = await import("@opentelemetry/exporter-trace-otlp-http");
    const { Resource } = await import("@opentelemetry/resources");
    const { SemanticResourceAttributes } = await import("@opentelemetry/semantic-conventions");

    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

    const exporter = new OTLPTraceExporter({ url: `${endpoint}/v1/traces` });
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || "wcagai-platform",
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || "development",
    });

    const sdk = new NodeSDK({
      traceExporter: exporter,
      resource,
    });

    await sdk.start();
    // Provide a shutdown hook on process exit
    process.on("SIGINT", () => sdk.shutdown().finally(() => process.exit(0)));
    process.on("SIGTERM", () => sdk.shutdown().finally(() => process.exit(0)));
  } catch (err) {
    // Tracing is optional; log and continue without failing startup
    console.warn("OpenTelemetry init skipped:", (err as Error)?.message || err);
  }
}
