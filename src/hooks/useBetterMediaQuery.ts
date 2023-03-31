import { useEffect, useState } from "react";

// TRICKS made to fix useMediaQuery()
//
// https://github.com/chakra-ui/chakra-ui/issues/3580
export default function useBetterMediaQuery(mediaQueryString: string) {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQueryString);
    const listener = () => setMatches(!!mediaQueryList.matches);

    listener();

    mediaQueryList.addListener(listener);

    return () => mediaQueryList.removeListener(listener);
  }, [mediaQueryString]);

  return matches;
}
