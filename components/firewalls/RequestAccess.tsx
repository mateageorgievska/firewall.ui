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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publicIp, setPublicIp] = useState("");
  const [duration, setDuration] = useState("1_day");
  const [port, setPort] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  const isValidIp = (ip: string): boolean => {
    const ipRegex =
      /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    return ipRegex.test(ip);
  };

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
    publicIp: string,
    port: string,
    user: string,
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
        const firewallData =
          matchedDetailedInstance?.workflowData?.firewall?.data;
        if (!firewallData?.firewallId || !firewallData?.publicIp) {
          console.warn("Workflow data not ready yet");
          setErrorMessage(
            "The request is still being processed. Please try again in a few seconds.",
          );
          return;
        }

        await generalStore.postFirewallRules(
          matchedDetailedInstance?.workflowData?.firewall?.data?.firewallId,
          matchedDetailedInstance?.workflowData?.firewall?.data?.publicIp,
          matchedDetailedInstance?.workflowData?.firewall?.data?.duration,
          port,
          user,
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
        publicIp: "",
        duration: "1_day",
        requestedBy: session?.user?.email ?? "",
      })),
    );
  }, [firewalls, session]);

  const handleChange = (
    index: number,
    field: keyof FirewallSelection,
    value: string | boolean,
  ) => {
    const updated = [...selections];
    // @ts-expect-error: dynamic key assignment to FirewallSelection type
    updated[index][field] = value;

    if (field === "selected" && value === true) {
      updated[index].publicIp = publicIp;
      updated[index].duration = duration;
    }

    setSelections(updated);
    setSelectAll(updated.every((s) => s.selected));
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    const updated = selections.map((s) => ({
      ...s,
      selected: newSelectAll,
      publicIp: newSelectAll ? publicIp : s.publicIp,
      duration: newSelectAll ? duration : s.duration,
    }));
    setSelections(updated);
  };

  const handleSubmit = async (port: string) => {
    if (submitting) return;
    setSubmitting(true);

    const selected = selections
      .filter((s) => s.selected && s.publicIp)
      .map((s) => ({ ...s }));

    if (selected.length === 0) {
      setErrorMessage(
        "Please select at least one firewall and enter a public IP address.",
      );
      setSubmitting(false);
      return;
    }

    const invalidIpSelected = selected.some((s) => !isValidIp(s.publicIp));
    if (invalidIpSelected) {
      setErrorMessage(
        "Please enter a valid public IP address for all selected firewalls.",
      );
      setSubmitting(false);
      return;
    }
    if (!port) {
      setErrorMessage("Please select a port.");
      setSubmitting(false);
      return;
    }

    try {
      await Promise.all(
        selected.map((sel) =>
          handleProcessInstance(sel.id, sel.publicIp, port, sel.requestedBy),
        ),
      );

      onSubmit(selected);

      setPublicIp("");
      setDuration("1_day");
      setPort("");
      setSearchTerm("");
      setSelectAll(false);
      setSelections((prev) =>
        prev.map((s) => ({
          ...s,
          selected: false,
          publicIp: "",
          duration: "1_day",
        })),
      );

      router.push("/firewalls/requests");
    } catch (error) {
      console.error("Error submitting firewall requests:", error);
      setErrorMessage("Failed to submit firewall requests. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSelections = selections.filter(
    (fw) =>
      fw.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fw.id.toString().includes(searchTerm),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <span className="text-white font-bold text-xl">🛡️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Firewall Access Request
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {session?.user?.email}
              </span>
              <button className="text-gray-400 hover:text-gray-600">
                <span className="text-lg">🚪</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search firewalls by name or ID..."
              className="pl-10 pr-4 py-2 w-full max-w-md border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                      <span className="ml-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select All
                      </span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Firewall ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                  >
                    Labels
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                  >
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSelections.map((fw) => (
                  <tr
                    key={fw.id}
                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                      fw.selected ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={fw.selected}
                        onChange={(e) =>
                          handleChange(
                            selections.indexOf(fw),
                            "selected",
                            e.target.checked,
                          )
                        }
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {fw.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-700 mr-2">🛡️</span>
                        <span className="text-sm text-gray-700">{fw.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <span className="text-sm text-gray-500">
                        {fw.labels
                          ? Object.entries(fw.labels)
                              .map(([k, v]) => `${k}=${v}`)
                              .join(", ")
                          : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <span className="text-sm text-gray-500">
                        {fw.created
                          ? format(new Date(fw.created), "dd MMM yyyy")
                          : "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSelections.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">🛡️</span>
                <h3 className="text-sm font-medium text-gray-900">
                  No firewalls found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search to find what you&apos;re looking
                  for.
                </p>
              </div>
            )}
          </div>

          {/* Input Section */}
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Public IP Input */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <span className="mr-2">🌐</span>
                  Public IP Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className={`block w-full px-4 py-2 border ${
                      publicIp && !isValidIp(publicIp)
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } rounded-lg shadow-sm bg-white`}
                    placeholder="e.g., 192.168.1.1"
                    value={publicIp}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPublicIp(value);
                      setSelections((prev) =>
                        prev.map((s) =>
                          s.selected ? { ...s, publicIp: value } : s,
                        ),
                      );
                    }}
                  />
                  {publicIp && !isValidIp(publicIp) && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <span className="text-red-500">⚠️</span>
                    </div>
                  )}
                </div>
                {publicIp && !isValidIp(publicIp) && (
                  <p className="text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    Invalid IP address format
                  </p>
                )}
              </div>

              {/* Duration Select */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <span className="mr-2">⏱️</span>
                  Access Duration
                </label>
                <select
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={duration}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDuration(value);
                    setSelections((prev) =>
                      prev.map((s) =>
                        s.selected ? { ...s, duration: value } : s,
                      ),
                    );
                  }}
                >
                  <option value="1_day">1 Day - Temporary Access</option>
                  <option value="1_week">1 Week - Extended Access</option>
                </select>
              </div>

              {/* Port Select */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <span className="mr-2">🔌</span>
                  Port Select
                </label>
                <select
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={port}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPort(value);
                  }}
                >
                  <option value="" hidden></option>
                  <option value="1433">1433 - SQL Server</option>
                  <option value="22">22 - SSH</option>
                  <option value="9000">9000 - MinIO</option>
                  <option value="9090">9090 - MinIO UI</option>
                </select>
              </div>
            </div>
            {/* Submit Button */}
            <div className="mt-6 flex justify-center">
              <button
                disabled={submitting}
                onClick={() => handleSubmit(port)}
                className="inline-flex items-center justify-center px-8 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                {submitting ? (
                  <>
                    <span className="mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    Submit Request
                    <span className="ml-2">→</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <span className="text-red-400 mr-2">⚠️</span>
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Selected Count */}
            {selections.some((s) => s.selected) && (
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                {selections.filter((s) => s.selected).length} firewall(s)
                selected
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Total Firewalls</p>
            <p className="text-2xl font-semibold text-gray-900">
              {firewalls.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Selected</p>
            <p className="text-2xl font-semibold text-blue-600">
              {selections.filter((s) => s.selected).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <p className="text-sm text-gray-500">Available</p>
            <p className="text-2xl font-semibold text-green-600">
              {firewalls.length - selections.filter((s) => s.selected).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestAccess;
