export type ClipType = "auto" | "margin" | "single";
export type ClipLayout = "horizontal" | "vertical";
export type EditParams = {
  count: number;
  rotate?: number;
  start_x?: number;
  start_y?: number;
  end_x?: number;
  end_y?: number;
  blank_top?: number;
  blank_bottom?: number;
  blank_left?: number;
  blank_right?: number;
  paper_w?: number;
  paper_h?: number;
  clipType: ClipType;
  clipTopPercent?: number;
  clipLeftPercent?: number;
  clipHeightPercent?: number;
  clipWidthPercent?: number;
  layout: ClipLayout;
  autoToning: boolean;
  naturalWidth?: number;
  naturalHeight?: number;
};

export type TImage = {
  id: string;
  url: string;
  preview_url: string;
  filename: string;
  content_type: string;
  size: number;
  created_at: string;
  edited_params: EditParams;
};

export interface IOrder {
  order_number: string;
  order_name: string;
  order_type: string;
  photo_size: string;
  max_photo_count: number;
  customer_status: string;
  merchant_status: string;
  images: TImage[];
  history_images: string[];
  remark: Record<string, any>;
  created_at: string;
  updated_at: string;
}
