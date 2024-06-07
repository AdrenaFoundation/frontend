'use client'; // NextJS 13 requires this. Remove if you are using NextJS 12 or lower
import Script from 'next/script';
import { useEffect } from 'react';

const Featurebase = () => {
  useEffect(() => {
    const win = window as any;

    if (typeof win.Featurebase !== 'function') {
      win.Featurebase = function () {
        // eslint-disable-next-line prefer-rest-params
        (win.Featurebase.q = win.Featurebase.q || []).push(arguments);
      };
    }
    win.Featurebase('initialize_feedback_widget', {
      organization: 'adrena',
      theme: 'dark',
      placement: 'bottom-left',
    });
  }, []);

  return (
    <Script src="https://do.featurebase.app/js/sdk.js" id="featurebase-sdk" />
  );
};

export default Featurebase;
