
import Modal, { ModalRef } from '@/app/_components/modal';
import { DocumentType } from '@/types';
import Uppy, { UppyFile } from '@uppy/core';
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import { Dashboard } from '@uppy/react';
import XHR from '@uppy/xhr-upload';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiPresentationChartBar } from 'react-icons/hi2';
import useOrg from '../../_provider/useOrg';
import { uploadDocument } from '../_actions/documents.actions';

interface UploadDocumentModalProps {
  modalRef: React.RefObject<ModalRef>;
  document_id?: string;
  document_name?: string;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  modalRef,
  document_id,
  document_name,
}) => {
  const router = useRouter();
  const { org } = useOrg();

  /*-------------------------------- FUNCTIONS ------------------------------*/

  const handleBeforeUpload = (files: {
    [key: string]: UppyFile<Record<string, unknown>, Record<string, unknown>>;
  }) => {

    if (Object.keys(files).length > 1) return false;

    let file = files[Object.keys(files)[0]];

    if (file.type !== 'application/pdf') return false;

    return true;
  };

  const uppy = new Uppy({
    id: 'uppy',
    restrictions: {
      allowedFileTypes: ['.pdf'],
      maxFileSize: 100000000, // 1MB
    },
    onBeforeUpload: (files) => handleBeforeUpload(files),
    allowMultipleUploads: false,
  }).use(XHR, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'x-upsert': 'true',
    },
    endpoint: `${
      process.env.NEXT_PUBLIC_SUPABASE_URL
    }/storage/v1/object/documents/TEMP/${Math.round(Math.random() * 1000000)}`,
  });

  uppy.on('upload-success', async (file, response) => {
    const path = (response.body.Key as string).replace(`documents/`, '');

    const postUploadPromise = new Promise<DocumentType>(
      async (resolve, reject) => {
        try {
          const new_document = await uploadDocument({
            document_id,
            path,
            source_path: file?.name ?? 'New document',
            document_name,
            source_type: 'LOCAL',
            org_id: org.org_id,
          });

          if (!new_document) {
            throw new Error('Error uploading document');
          }

          resolve(new_document);
          router.refresh();
          modalRef.current?.closeModal();
        } catch (error) {
          reject(false);
        }
      }
    );

    await toast.promise(postUploadPromise, {
      loading: 'Processing your document...',
      success: (new_doc: DocumentType) => (
        <div className={`max-w-1/2 flex items-center justify-start gap-x-4`}>
          <div className="flex flex-col gap-y-1">
            <p className="">
              <span className="text-stratos-default font-semibold">
                {document_name || file?.name}
              </span>{' '}
              {document_id ? 'updated' : 'uploaded'} successfully
            </p>
            <p className="font-normal">
              You can now create secure links for sharing.
            </p>
          </div>
          <Link
            onClick={(e) => {
              e.stopPropagation();
              toast.dismiss(`${new_doc.document_id}-toast`);
            }}
            href={`/preview/${new_doc.document_id}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-stratos-default flex flex-col items-center gap-y-1 border-l pl-2 hover:underline"
          >
            <HiPresentationChartBar className="h-5 w-5 " />
            <span className="font-normal">{`Preview`}</span>
          </Link>
        </div>
      ),
      error: 'Upload failed, please try again',
    });
  });

  uppy.on('upload-error', (file, error) => {
    toast.error('Upload failed, please try again');
  });

  /*-------------------------------- RENDER ------------------------------*/

  return (
    <Modal
      ref={modalRef}
      title={document_id ? 'Update document' : 'Upload new document'}
    >
      <Dashboard
        uppy={uppy}
        plugins={[]}
        proudlyDisplayPoweredByUppy={false}
        showProgressDetails={true}
        hideUploadButton={false}
        target="uppy-upload-area"
        height={200}
      />
    </Modal>
  );
};

export default UploadDocumentModal;
