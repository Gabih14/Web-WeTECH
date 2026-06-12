import React from "react";
import emailjs from "@emailjs/browser";

type Props = {
  children: React.ReactNode;
};

type ErrorReport = {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  createdAt: string;
};

type State = {
  hasError: boolean;
  copied: boolean;
  report: ErrorReport | null;
  emailSent: boolean;
};

const ERROR_REPORT_EMAIL = "virtual.hache@gmail.com";
const EMAILJS_SERVICE_ID =
  import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_ql4q72a";
const EMAILJS_TEMPLATE_ID =
  import.meta.env.VITE_EMAILJS_ERROR_TEMPLATE_ID ||
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID ||
  "template_yt57d62";
const EMAILJS_PUBLIC_KEY =
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "KtgXJK3IzzROv0Uhs";

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    copied: false,
    report: null,
    emailSent: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true, copied: false, report: null, emailSent: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const report = this.createErrorReport(error, errorInfo);

    this.setState({ report });
    this.saveErrorReport(report);
    this.sendErrorReport(report);
    console.error("Error no controlado en la app", report, error, errorInfo);
  }

  createErrorReport(error: Error, errorInfo: React.ErrorInfo): ErrorReport {
    return {
      id: this.createErrorId(),
      message: error.message || "Error sin mensaje",
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      url: window.location.href,
      userAgent: window.navigator.userAgent,
      createdAt: new Date().toISOString(),
    };
  }

  createErrorId() {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID().slice(0, 8).toUpperCase();
    }

    return Math.random().toString(36).slice(2, 10).toUpperCase();
  }

  saveErrorReport(report: ErrorReport) {
    try {
      window.localStorage.setItem("lastAppError", JSON.stringify(report));
    } catch (error) {
      console.warn("No se pudo guardar el reporte de error.", error);
    }
  }

  hasReportAlreadyBeenSent(report: ErrorReport) {
    try {
      return window.sessionStorage.getItem(`sentAppError:${report.id}`) === "1";
    } catch {
      return false;
    }
  }

  markReportAsSent(report: ErrorReport) {
    try {
      window.sessionStorage.setItem(`sentAppError:${report.id}`, "1");
    } catch {
      return;
    }
  }

  sendErrorReport(report: ErrorReport) {
    if (this.hasReportAlreadyBeenSent(report)) {
      return;
    }

    const templateParams = {
      to_email: ERROR_REPORT_EMAIL,
      to_name: "WeTECH",
      from_name: "Web WeTECH",
      from_email: ERROR_REPORT_EMAIL,
      subject: `Error web WeTECH ${report.id}`,
      name: "ErrorBoundary",
      phone: "No aplica",
      zone: report.url,
      message: this.getReportTextFromReport(report),
      error_id: report.id,
      error_message: report.message,
      error_url: report.url,
      error_date: report.createdAt,
      user_agent: report.userAgent,
      stack: report.stack || "Sin stack",
      component_stack: report.componentStack || "Sin component stack",
    };

    emailjs
      .send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        this.markReportAsSent(report);
        this.setState({ emailSent: true });
      })
      .catch((error) => {
        console.error("No se pudo enviar el reporte de error por email.", error);
      });
  }

  getReportTextFromReport(report: ErrorReport) {
    return JSON.stringify(report, null, 2);
  }

  getReportText() {
    if (!this.state.report) {
      return "Reporte no disponible";
    }

    return this.getReportTextFromReport(this.state.report);
  }

  copyReport = async () => {
    try {
      await window.navigator.clipboard.writeText(this.getReportText());
      this.setState({ copied: true });
    } catch (error) {
      console.warn("No se pudo copiar el reporte de error.", error);
    }
  };

  render() {
    if (this.state.hasError) {
      const report = this.state.report;

      return (
        <div className="min-h-screen bg-gray-100 px-4 py-16">
          <div className="mx-auto max-w-lg rounded-lg bg-white p-6 text-center shadow-md">
            <h1 className="text-xl font-semibold text-gray-900">
              No pudimos cargar esta seccion
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Actualiza la pagina para volver a intentarlo. Si el problema
              continua, escribinos y te ayudamos con tu compra.
            </p>
            {report && (
              <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Codigo de error
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-gray-900">
                  {report.id}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Detalle tecnico
                </p>
                <p className="mt-1 break-words text-sm text-gray-700">
                  {report.message}
                </p>
                <p className="mt-3 text-xs text-gray-500">
                  {this.state.emailSent
                    ? "El reporte fue enviado automaticamente."
                    : "Intentando enviar el reporte automaticamente."}
                </p>
              </div>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg bg-yellow-400 px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-yellow-500"
              >
                Recargar pagina
              </button>
              {report && (
                <button
                  type="button"
                  onClick={this.copyReport}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  {this.state.copied ? "Detalle copiado" : "Copiar detalle"}
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
