import { EditParams, IOrder } from "@/typings";
import { http } from "@/utils/http";

export const updateImageParams = ({
  orderId,
  imageId,
  params,
}: {
  orderId: string;
  imageId: string;
  params: EditParams;
}) => http.put(`/images/${orderId}/${imageId}/edit`, params);

export const updateImageListParams = (
  orderId: string,
  params: Record<string, EditParams>,
) => http.put(`/images/${orderId}/edit_list`, params);

export const updateOrder = (orderId: string, params: Partial<IOrder>) =>
  http.put(`/orders/${orderId}`, params);

export const getImageInfo = (orderId: string, imageId: string) =>
  http.get(`/images/${orderId}/${imageId}/info`);

export const getImageInfoList = (orderId: string, imageIds: string[]) =>
  http.get(`/images/${orderId}/${imageIds.join(",")}/info_list`);

export const deleteImageList = (orderId: string, imageIds: string[]) =>
  http.delete(`/images/${orderId}/${imageIds.join(",")}/delete_list`);

export const deleteHistoryImageList = (orderId: string, imageIds: string[]) =>
  http.delete(`/images/${orderId}/${imageIds.join(",")}/delete_history`);

export const recoverHistoryImageList = (orderId: string, imageIds: string[]) =>
  http.get(`/images/${orderId}/${imageIds.join(",")}/recover_history`);

export const getPhotoSizeList = () => http.get(`/param/photo-sizes`);

export const customerConfirm = (orderId: string) =>
  http.post(`/orders/${orderId}/customer_confirm`);
