interface FeatureFlagProps {
  featureFlagName: string;
  children: any;
}

const FeatureFlag: React.FunctionComponent<FeatureFlagProps> = (
  { featureFlagName, children }: FeatureFlagProps
) => {
  if (process.env.NEXT_PUBLIC_FEATURE_FLAG as string !== featureFlagName) {
    return null;
  }

  return children;
};

export default FeatureFlag;

export const withFeatureFlag = (featureFlagName: string) => <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => (
  (props) => (
    process.env.NEXT_PUBLIC_FEATURE_FLAG as string === featureFlagName
      ? <WrappedComponent {...props as P} />
      : null
  )
);
