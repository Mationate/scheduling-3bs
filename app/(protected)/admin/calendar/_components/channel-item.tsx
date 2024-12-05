import { Channel, ChannelBox, ChannelLogo } from "planby";

interface ChannelItemProps {
  channel: Channel;
}

export const ChannelItem = ({ channel }: ChannelItemProps) => {
  const { position, logo, name } = channel;
  return (
    <ChannelBox {...position}>
      <ChannelLogo
        src={logo}
        alt={name}
        style={{ maxHeight: 52, maxWidth: 52, borderRadius: "50%" }}
      />
        <span className="text-sm font-medium truncate">
        {channel.name}
      </span>
    </ChannelBox>
  );
}; 