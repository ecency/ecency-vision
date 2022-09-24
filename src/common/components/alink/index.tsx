import React from 'react';
import { Link as LinkImport} from 'react-router-dom';
  
const Link = (oprops: any) => (
    /^https?:\/\//.test(oprops.to)
      ? (
        <a
          href={oprops.to}
          {...oprops}
        />
      ) : (
        <LinkImport
          {...oprops}
        />
      )
  );

export default Link;
