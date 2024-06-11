import React, { useCallback } from "react";
import useMount from "react-use/lib/useMount";
import useUnmount from "react-use/lib/useUnmount";

interface Props {
  onBottom: () => any;
}

export default class DetectBottos extends React.Component<Props> {
  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll = () => {
    const { onBottom } = this.props;
    if (window.innerHeight + window.scrollY + 100 >= document.body.offsetHeight) {
      onBottom();
    }
  };

  render() {
    return null;
  }
}

export function DetectBottom({ onBottom }: Props) {
  const handleScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY + 100 >= document.body.offsetHeight) {
      onBottom();
    }
  }, [onBottom]);

  useMount(() => {
    window.addEventListener("scroll", handleScroll);
  });

  useUnmount(() => {
    window.removeEventListener("scroll", handleScroll);
  });

  return <></>;
}
