import React from "react";
import { injectIntl, IntlShape } from "react-intl";
import AppLayout from "@/components/AppLayout";

interface Props {
  intl: IntlShape;
}

const Firewalls: React.FC<Props> = ({ intl }) => {
  const subMenus = [
    {
      name: intl.formatMessage({
        id: "access",
        defaultMessage: "Request Access",
      }),
      slug: "/firewalls/request-access",
    },
    {
      name: intl.formatMessage({ id: "requests", defaultMessage: "Requests" }),
      slug: "/firewalls/requests",
    },
  ];

  return (
    <AppLayout
      headerTitle={intl.formatMessage({
        id: "firewalls",
        defaultMessage: "Firewalls",
      })}
      subMenus={subMenus}
    >
      <div className="p-8 space-y-4">
        <div className="flex justify-end">
        </div>
      </div>
    </AppLayout>
  );
};

export default injectIntl(Firewalls);
