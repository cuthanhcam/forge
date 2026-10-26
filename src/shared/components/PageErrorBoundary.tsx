import { Component, type ReactNode } from "react";
import { PageErrorState } from "./PageErrorState";

interface Props {
  children: ReactNode;
  showFooter?: boolean;
  standalone?: boolean;
}
interface State {
  failed: boolean;
}

/** Keep errors local: never render exception messages that could contain tool input. */
export class PageErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false };
  static getDerivedStateFromError(): State {
    return { failed: true };
  }
  override render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    const recovery = <PageErrorState showFooter={this.props.showFooter} />;
    return this.props.standalone ? (
      <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
        {recovery}
      </div>
    ) : (
      recovery
    );
  }
}
