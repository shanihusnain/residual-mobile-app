import { Image } from "expo-image";
import { View, type StyleProp, type ViewStyle } from "react-native";

const VIEWBOX_WIDTH = 122;
const VIEWBOX_HEIGHT = 24;

const LOGO_DARK = require("@/assets/images/residual-logo.png");
const LOGO_LIGHT = require("@/assets/images/residual-logo-light.png");

/** residual.ae wordmark */
export function BrandLogo({
  size = 28,
  style,
  light,
}: {
  /** Height of the wordmark; width scales from the brand aspect ratio */
  size?: number;
  style?: StyleProp<ViewStyle>;
  light?: boolean;
}) {
  const height = size;
  const width = (VIEWBOX_WIDTH / VIEWBOX_HEIGHT) * height;

  return (
    <View style={style} accessibilityLabel="residual.ae">
      <Image
        source={light ? LOGO_LIGHT : LOGO_DARK}
        style={{ width, height }}
        contentFit="contain"
      />
    </View>
  );
}
