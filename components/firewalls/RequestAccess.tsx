import { FirewallDTO } from "@/interfaces/Firewall";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { useStore } from "@/hooks/StoreHook";

interface FirewallSelection extends FirewallDTO {
  selected: boolean;
  publicIp: string;
  duration: string;
  requestedBy: string;
}

interface Props {
  firewalls: FirewallDTO[];
  onSubmit: (requests: FirewallSelection[]) => void;
}

const RequestAccess: React.FC<Props> = ({ firewalls, onSubmit }) => {
  const [selections, setSelections] = useState<FirewallSelection[]>([]);
  const { data: session } = useSession();
  const { generalStore } = useStore();
  const router = useRouter();
  const isValidIp = (ip: string): boolean => {
    const ipRegex =
      /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    return ipRegex.test(ip);
  };
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publicIp, setPublicIp] = useState("");
  const [duration, setDuration] = useState("1_day");
  const payloadProcessInstance = {
    draw: 1,
    start: 0,
    length: 77,
    collection: "WorkflowInstance",
    "columns[0][name]": "_id",
    "columns[0][include]": true,
    "columns[1][name]": "Name",
    "columns[1][include]": true,
    "columns[2][name]": "Status",
    "columns[2][include]": true,
    "columns[3][name]": "WorkflowData",
    "columns[3][include]": true,
    "columns[4][name]": "Name",
    "columns[4][searchable]": true,
    "columns[4][search][value]": "FirewallRequestStatusUpdate",
    "columns[4][search][regex]": false,
    "order[0][column]": "0",
    "order[0][dir]": "desc",
  };

  const handleProcessInstance = async (
    firewallId: number,
    publicIp: string
  ) => {
    try {
      await generalStore.getProcessInstances(payloadProcessInstance);

      let matchedDetailedInstance = null;

      for (const instance of generalStore.processInstances) {
        await generalStore.getProcessInstanceById(instance._id);
        const detailedInstance = generalStore.processInstance;

        if (!detailedInstance) {
          continue;
        }

        const wfData = detailedInstance.workflowData;

        const instanceFirewallId =
          wfData.firewall?.data?.firewallId ?? wfData?.firewallId?.data;
        const instancePublicIp =
          wfData.firewall?.data?.publicIp ?? wfData?.publicIp?.data;

        if (
          instanceFirewallId === undefined ||
          instancePublicIp === undefined ||
          wfData === undefined
        ) {
          continue;
        }
        if (
          instanceFirewallId === firewallId &&
          instancePublicIp === publicIp
        ) {
          matchedDetailedInstance = detailedInstance;
          break;
        }
      }

      if (matchedDetailedInstance) {
        //firewall rules
        await generalStore.postFirewallRules(
          matchedDetailedInstance?.workflowData.firewall.data.firewallId,
          matchedDetailedInstance?.workflowData.firewall.data.publicIp,
          matchedDetailedInstance?.workflowData.firewall.data.duration
        );
      }
    } catch (error) {
      console.error("Error in handleProcessInstance:", error);
    }
  };

  useEffect(() => {
    setSelections(
      firewalls.map((fw) => ({
        ...fw,
        selected: false,
        publicIp: publicIp,
        duration: duration,
        requestedBy: session?.user?.email ?? "",
      }))
    );
  }, [firewalls, session, publicIp, duration]);

  const handleChange = (
    index: number,
    field: keyof FirewallSelection,
    value: string | boolean
  ) => {
    const updated = [...selections];
    // @ts-expect-error: dynamic key assignment to FirewallSelection type
    updated[index][field] = value;

    if (field === "selected" && value === true) {
      setPublicIp(updated[index].publicIp);
      setDuration(updated[index].duration);
    }

    setSelections(updated);
  };

  const handleSubmit = () => {
    const selected = selections
      .filter((s) => s.selected && s.publicIp)
      .map((s) => ({ ...s }));
    onSubmit(selected);

    if (selected.length === 0) {
      setErrorMessage("Please select a firewall.");
      return;
    }

    selected.forEach((sel) => {
      //handleProcessInstance(sel.id, sel.publicIp, true);
      handleProcessInstance(sel.id, sel.publicIp);
    });
    router.push("/firewalls/requests");
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow-sm border-b border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-s font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Select
                  </th>
                   <th
                    scope="col"
                    className="px-6 py-3 text-left text-s font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Firewall ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-s text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-s text-gray-500 uppercase tracking-wider hidden"
                  >
                    Labels
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-s text-gray-500 uppercase tracking-wider hidden"
                  >
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selections.map((fw, idx) => (
                  <tr key={fw.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={fw.selected}
                        onChange={(e) =>
                          handleChange(idx, "selected", e.target.checked)
                        }
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fw.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {fw.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden">
                      {fw.labels
                        ? Object.entries(fw.labels)
                            .map(([k, v]) => `${k}=${v}`)
                            .join(", ")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden">
                      {format(new Date(fw.created ?? ""), "dd MMMM yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 mt-10 md:flex-row md:justify-center">
        <div className="font-lato flex flex-col">
          <label className="font-medium mb-1 text-gray-600">
            Public IP Address
          </label>
          <input
            type="text"
            className="border rounded text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 w-64 bg-gray-100 block"
            placeholder="Enter your IP address..."
            value={publicIp}
            onChange={(e) => setPublicIp(e.target.value)}
            required
          />
          <p
            className={`mt-1 text-sm min-h-5 ${
              publicIp && !isValidIp(publicIp)
                ? "text-red-600 visible"
                : "invisible"
            }`}
          >
            {publicIp && !isValidIp(publicIp)
              ? "Invalid IP address format"
              : " "}
          </p>
        </div>

        <div className="font-lato flex flex-col">
          <label className="font-medium mb-1 text-gray-600">Duration</label>
          <select
            className="rounded border border-gray-300 px-4 py-1.5 w-64 text-gray-600 bg-gray-100"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          >
            <option value="1_day">1 Day</option>
            <option value="1_week">1 Week</option>
          </select>
          <p className="mt-1 text-sm min-h-5">&nbsp;</p>
        </div>

        <div className="font-lato mt-6">
          <button
            onClick={handleSubmit}
            className="inline-flex items-center px-5 py-2 mb-5 border border-transparent text-sm 
            font-medium rounded-lg shadow-md text-white bg-sky-700 hover:bg-sky-800 focus:outline-none"
          >
            Submit Request
          </button>
        </div>
        {errorMessage && (
          <p className="text-red-600 text-center mt-4">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default RequestAccess;
