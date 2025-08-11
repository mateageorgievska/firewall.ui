import React, { useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { useStore } from "../../hooks/StoreHook";
import RequestAccess from "@/components/firewalls/RequestAccess";
import { injectIntl, IntlShape } from "react-intl";
import { observer } from "mobx-react-lite";
import { FirewallSelection } from "@/interfaces/Firewall";

interface Props {
  intl: IntlShape;
}

const RequestAccessPage: React.FC<Props> = observer(({ intl }) => {
  const { generalStore } = useStore();
  const handleSubmit = (selectedFirewalls: FirewallSelection[]) => {
    generalStore.startFirewallProcess(selectedFirewalls);
  };

  useEffect(() => {
    generalStore.getFirewalls({});
  }, []);

  return (
    <AppLayout
      headerTitle={intl.formatMessage({
        id: "requestAccess",
        defaultMessage: "Request Access",
      })}
    >
      <div className="p-8">
        <RequestAccess
          firewalls={generalStore.firewalls}
          onSubmit={handleSubmit}
        />
      </div>
    </AppLayout>
  );
});

export default injectIntl(RequestAccessPage);
