import { RequestDTO } from "@/interfaces/Firewall";
import { RequestStatuses } from "@/utilities/firewalls/general";
import { ColumnDef } from "@tanstack/react-table";
import { NextRouter } from "next/router";
import { useMemo } from "react";
import { FormattedMessage, IntlShape } from "react-intl";
import { useStore } from "./StoreHook";
import { format } from "date-fns";
import { FiCheck, FiX } from "react-icons/fi";

export const useRequestsColumns = (
  intl: IntlShape,
  router: NextRouter
  // completeUserTask: (taskId: string, approve: boolean) => void
) => {
  const { generalStore } = useStore();
  const isAdmin = generalStore.user?.roles?.includes("Admin") ?? false;

  // const payloadProcessInstance = {
  //   draw: 1,
  //   start: 0,
  //   length: 76,
  //   collection: "WorkflowInstance",
  //   "columns[0][name]": "_id",
  //   "columns[0][include]": true,
  //   "columns[1][name]": "Name",
  //   "columns[1][include]": true,
  //   "columns[2][name]": "Status",
  //   "columns[2][include]": true,
  //   "columns[3][name]": "WorkflowData",
  //   "columns[3][include]": true,
  //   "columns[4][name]": "Name",
  //   "columns[4][searchable]": true,
  //   "columns[4][search][value]": "FirewallRequestStatusUpdate",
  //   "columns[4][search][regex]": false,
  //   "order[0][column]": "0",
  //   "order[0][dir]": "desc",
  // };

  // const handleProcessInstance = async (
  //   requestId: string,
  //   approved: boolean
  // ) => {
  //   try {
  //     await generalStore.getProcessInstances(payloadProcessInstance);

  //     let matchedDetailedInstance = null;

  //     for (const instance of generalStore.processInstances) {
  //       await generalStore.getProcessInstanceById(instance._id);
  //       const detailedInstance = generalStore.processInstance;

  //       if (!detailedInstance) continue;

  //       const detailedRequestId =
  //         detailedInstance.workflowData?.firewall?.data?.id;

  //       if (detailedRequestId === requestId) {
  //         matchedDetailedInstance = detailedInstance;
  //         break;
  //       }
  //     }

  //     if (!matchedDetailedInstance) {
  //       console.warn(
  //         "No matching detailed process instance found for requestId:",
  //         requestId
  //       );
  //       return;
  //     }

  //     const userTasksArray = matchedDetailedInstance.userTasksArray;

  //     if (!Array.isArray(userTasksArray) || userTasksArray.length === 0) {
  //       console.warn("No user tasks found in matched detailed instance");
  //       return;
  //     }
  //     const userTaskId = userTasksArray[0].id;
  //     //completeUserTask(userTaskId, approved);
  //     completeUserTask(userTaskId, true);

  //     //firewall-rules
  //     if (true) {
  //       const firewallId =
  //         matchedDetailedInstance.workflowData.firewall.data.firewallId;
  //       const publicIp =
  //         matchedDetailedInstance.workflowData.firewall.data.publicIp;
  //       const duration =
  //         matchedDetailedInstance.workflowData.firewall.data.duration;

  //       console.log("Calling postFirewallRules with:", {
  //         firewallId,
  //         publicIp,
  //         duration,
  //       });
  //     await generalStore.postFirewallRules(firewallId, publicIp, duration);
  //     }
  //     //generalStore.postFirewallRules(firewallId, publicIp, "1_minute");
  //   } catch (error) {
  //     console.error("Error in handleProcessInstance:", error);
  //   }
  // };

  const columns = useMemo<ColumnDef<RequestDTO, any>[]>(
    () => [
      {
        accessorFn: (row) => row?.id,
        accessorKey: "id",
        cell: (info) => info.getValue() ?? "N/A",
        header: () => (
          <span>
            {intl.formatMessage({
              id: "id",
              defaultMessage: "Request Id",
            })}
          </span>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row?.firewallId,
        accessorKey: "firewallId",
        cell: (info) => info.getValue() ?? "N/A",
        header: () => (
          <span>
            {intl.formatMessage({
              id: "firewallId",
              defaultMessage: "Firewall Id",
            })}
          </span>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row?.publicIp,
        accessorKey: "publicIp",
        cell: (info) => info.getValue() ?? "N/A",
        header: () => (
          <span>
            {intl.formatMessage({
              id: "publicIP",
              defaultMessage: "Public IP",
            })}
          </span>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row?.duration,
        accessorKey: "duration",
        cell: (info) => {
          const val = info.getValue();
          if (val === "1_day") return "1 day";
          if (val === "1_week") return "1 week";
          return val ?? "N/A";
        },
        header: () => (
          <span>
            {intl.formatMessage({ id: "duration", defaultMessage: "Duration" })}
          </span>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row?.createdAt,
        accessorKey: "createdAt",
        cell: (info) => {
          const value = info.getValue();
          return value ? format(new Date(value), "dd MMMM yyyy") : "N/A";
        },
        header: () => (
          <span>
            {intl.formatMessage({
              id: "createdAt",
              defaultMessage: "Created At",
            })}
          </span>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row?.requestedBy,
        accessorKey: "requestedBy",
        cell: (info) => info.getValue() ?? "N/A",
        header: () => (
          <span>
            {intl.formatMessage({
              id: "requestedBy",
              defaultMessage: "Requested By",
            })}
          </span>
        ),
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row?.status,
        accessorKey: "status",
        cell: (info) => info.getValue() ?? "N/A",
        header: () => (
          <span>
            {intl.formatMessage({ id: "status", defaultMessage: "Status" })}
          </span>
        ),
        footer: (props) => props.column.id,
      },
      // {
      //   id: "actions",
      //   header: () => (
      //     <span>
      //       {intl.formatMessage({ id: "actions", defaultMessage: "Actions" })}
      //     </span>
      //   ),
      //   cell: ({ row }) => {
      //     if (!isAdmin) return null;
      //     const requestId = row.original.id;
      //     if (!requestId) return null;

      //     return (
      //       <div className="flex gap-2">
      //         <button
      //           className="bg-green-600 mr-1 hover:bg-green-700 text-white text-sm px-3 py-1.5 font-semibold rounded font-sans transition"
      //           onClick={() => {
      //             handleProcessInstance(requestId, true);
      //           }}
      //         >
      //           <FiCheck />
      //           {/* <FormattedMessage id="approve" defaultMessage="Approve" /> */}
      //         </button>
      //         <button
      //           className="bg-red-600 mr-1 hover:bg-red-700 text-white text-sm px-3 py-1.5 font-semibold rounded font-sans transition"
      //           onClick={() => {
      //             handleProcessInstance(requestId, false);
      //           }}
      //         >
      //           <FiX />
      //           {/* <FormattedMessage id="reject" defaultMessage="Reject" /> */}
      //         </button>
      //       </div>
      //     );
      //   },
      //   footer: (props) => props.column.id,
      // },
    ],
    [
      intl,
      router,
      // isAdmin,
      // generalStore.approvalTaskId,
      //generalStore.processInstance,
    ]
  );
  return columns;
};

export const StatusWidget = (statusId: number) => {
  switch (statusId) {
    case RequestStatuses.Pending:
      return (
        <div className="flex flex-row items-center space-x-1">
          <span className="rounded-full w-2 h-2 bg-gray-600"></span>
          <span className="ml-2">
            <FormattedMessage id="pending" defaultMessage="Pending" />
          </span>
        </div>
      );
    case RequestStatuses.Approved:
      return (
        <div className="flex flex-row items-center space-x-1">
          <span className="rounded-full w-2 h-2 bg-green-600"></span>
          <span className="ml-2">
            <FormattedMessage id="approved" defaultMessage="Approved" />
          </span>
        </div>
      );
    case RequestStatuses.Rejected:
      return (
        <div className="flex flex-row items-center space-x-1">
          <span className="rounded-full w-2 h-2 bg-green-600"></span>
          <span className="ml-2">
            <FormattedMessage id="rejected" defaultMessage="Rejected" />
          </span>
        </div>
      );
  }
};
