import { useStore } from "../../hooks/StoreHook";
import { observer } from "mobx-react-lite";
import { FormattedMessage, IntlShape, injectIntl } from "react-intl";
import SelectBox from "../../reusable-components/SelectBox";
import { RequestStatuses } from "../../utilities/firewalls/firewall";
import { FiSearch } from "react-icons/fi";

interface Props {
  intl: IntlShape;
  onSearch: () => void;
}
const Filter: React.FC<Props> = ({ intl, onSearch }) => {
  const { generalStore } = useStore();
  const { selectedRequestStatus } = generalStore;

  return (
    <div className="w-full flex gap-4 items-end">
      <div className="w-1/4">
        <SelectBox
          data={RequestStatuses}
          placeholder={intl.formatMessage({
            id: "status",
            defaultMessage: "Select a status...",
          })}
          nameField="label"
          selected={selectedRequestStatus}
          setSelected={generalStore.onSetSelectedRequestStatus}
        />
      </div>
      <div className="w-1/4">
        <button
          className="bg-sky-700 hover:bg-sky-800 text-white px-4.5 py-3.5 mb-1 rounded-md"
          onClick={onSearch}
        >
          <FiSearch />
          {/* <FormattedMessage id="search" defaultMessage={"Search"} /> */}
        </button>
      </div>
    </div>
  );
};

export default injectIntl(observer(Filter));
