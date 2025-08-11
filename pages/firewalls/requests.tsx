import React from 'react';
import AppLayout from '@/components/AppLayout';
import Requests from '@/components/firewalls/Requests';
import { injectIntl, IntlShape } from 'react-intl';

interface Props {
  intl: IntlShape;
}

const RequestsPage: React.FC<Props> = ({ intl }) => {
  return (
    <AppLayout headerTitle={intl.formatMessage({ id: 'requests', defaultMessage: 'Requests' })}>
      <div className="p-2">
        <Requests />
      </div>
    </AppLayout>
  );
};

export default injectIntl(RequestsPage);
