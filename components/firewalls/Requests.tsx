import { useStore } from "@/hooks/StoreHook";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo, useState } from "react";
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
  const pagination = useMemo(
    () => ({
      pageIndex: 0,
      pageSize: 10,
    }),
    [pageIndex, pageSize]
  );

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

  //const columns = useRequestsColumns(intl, router, generalStore.completeUserTask.bind(generalStore));
  const columns = useRequestsColumns(intl, router);

  const onSearch = () => {
    setFilters({
      requestStatusId: selectedRequestStatus?.value ?? undefined,
    });
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };


  return (
    <Fragment>
      <div className="">
        {requests && !loadingRequests ? (
          <Fragment>
            <div className="mb-4 p-2">
              <Filter onSearch={onSearch} />
            </div>
            <div className="p-2">
              <ServerPagination
                columns={columns}
                data={requests?.data ?? []}
                pagination={{
                  pageSize: pagination.pageSize,
                  pageIndex: pagination.pageIndex + 1,
                }}
                setPagination={setPagination}
                totalRecords={requests.totalRecords}
              />
            </div>
          </Fragment>
        ) : (
          loadingRequests
        )}
      </div>
    </Fragment>
  );
});

export default Requests;
