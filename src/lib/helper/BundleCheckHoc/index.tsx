import React from "react";
import useUI from "@/lib/hooks/useUI";

interface BundleCheckProps {
  componentBundle: string;
  children: any;
}

const BundleCheck: React.FunctionComponent<BundleCheckProps> = (
  { componentBundle, children }: BundleCheckProps
) => {
  const { activeBundle } = useUI();

  return activeBundle === componentBundle
    ? null
    : children;
};

export default BundleCheck;

export const withBundleCheck = (componentBundle: string) => <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => (
  (props) => {
    const { activeBundle } = useUI();

    return (
      activeBundle === componentBundle
        ? <WrappedComponent {...props as P} />
        : null
    );
  }
);