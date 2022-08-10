import React from "react";
import { DropzoneArea } from "material-ui-dropzone";
import "../../style/Common/DragDropFileUpload.scss";

const DragDropFileUpload = (props: any) => {
  const { handleImageChange, handleImageDrop, acceptedFiles } = props;

  return (
    <div className="boxUploadButton">
      <DropzoneArea
        onChange={(e) => handleImageChange(e)}
        dropzoneClass="btnItem"
        dropzoneText={""}
        acceptedFiles={[acceptedFiles]}
        maxFileSize={104000000}
        onDelete={(e) => handleImageDrop(e)}
        filesLimit={1}
      />
    </div>
  );
};

export default DragDropFileUpload;
