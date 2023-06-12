import moment from "moment/moment";

type Identifiable = Omit<any, "id"> & Required<{ id: string | number }>;

export function newDataComingPaginatedCondition(
  newCameData: Identifiable[],
  prevData?: Identifiable[]
) {
  const newCame = newCameData.filter((i) => !prevData?.some((it) => i.id === it.id))[0];
  const prevOne = (prevData ?? [])[0];
  return prevData?.length === 0 || moment(newCame?.created).isBefore(moment(prevOne?.created));
}
