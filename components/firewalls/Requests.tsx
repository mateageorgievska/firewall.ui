import { useStore } from "@/hooks/StoreHook";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { PaginationState } from "@tanstack/react-table";
import { useRequestsColumns } from "@/hooks/RequestsHook";
import { ServerPagination } from "@/reusable-components/controllers/Table";
import Filter from "./Filter";

const Requests: React.FC = observer(() => {
  const intl = useIntl();
  const router = useRouter();
  const { generalStore } = useStore();
  const { requests, loadingRequests, selectedRequestStatus } = generalStore;
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  
  const [filters, setFilters] = useState<{ requestStatusId?: number }>({});

  useEffect(() => {
    const payload = {
      keyword: "",
      filters,
      page: {
        pageSize: pageSize,
        pageNumber: pageIndex,
      },
    };
    generalStore.getRequests(payload);
  }, [pageIndex, pageSize, filters, generalStore]);

  const columns = useRequestsColumns(intl, router);

  const onSearch = () => {
    setFilters({
      requestStatusId: selectedRequestStatus?.value ?? undefined,
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <Fragment>
      <div className="min-h-screen bg-gray-50 p-6">
        {requests && !loadingRequests ? (
          <Fragment>
            {/* Header with title and filter */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-800 mb-4">Access Requests</h1>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <Filter onSearch={onSearch} />
              </div>
            </div>

            {/* Table section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-gray-700">
                    Request List
                  </h2>
                  <span className="text-xs text-gray-500">
                    Total: {requests?.totalRecords || 0}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <ServerPagination
                  columns={columns}
                  data={requests?.data ?? []}
                  pagination={{
                    pageSize: pageSize,
                    pageIndex: pageIndex + 1,
                  }}
                  setPagination={setPagination}
                  totalRecords={requests.totalRecords}
                />
              </div>
            </div>
          </Fragment>
        ) : (
          loadingRequests && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-gray-600">Loading requests...</p>
              </div>
            </div>
          )
        )}
      </div>
    </Fragment>
  );
});

export default Requests;