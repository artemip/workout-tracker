import { useEffect } from "react";

export default function useErrorLogger(error?: Error) {
  useEffect(() => {
    error && console.error("error", error);
  }, [error]);
}
