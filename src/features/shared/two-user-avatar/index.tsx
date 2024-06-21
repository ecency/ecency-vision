import defaults from "@/defaults.json";
import "./_index.scss";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  from: string;
  to: string;
  size?: string;
}

export function TwoUserAvatar({ size, to, from }: Props) {
  const canUseWebp = useGlobalStore((s) => s.canUseWebp);

  const imgSize =
    size === "xLarge" ? "large" : size === "normal" || size === "small" ? "small" : "medium";
  const cls = `two-user-avatar ${size}`;
  const imageSrc1 = `${defaults.imageServer}${
    canUseWebp ? "/webp" : ""
  }/u/${from}/avatar/${imgSize}`;
  const imageSrc2 = `${defaults.imageServer}${canUseWebp ? "/webp" : ""}/u/${to}/avatar/${imgSize}`;

  return (
    <div className="route flex">
      <span className={cls} style={{ backgroundImage: `url(${imageSrc1})` }} />
      <span className={cls} style={{ backgroundImage: `url(${imageSrc2})` }} />
    </div>
  );
}
