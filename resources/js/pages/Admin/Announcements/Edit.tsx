import AnnouncementForm from '../Announcement/Form';
export default function Edit(props: any) {
    return <AnnouncementForm {...props} isEditing={true} />;
}
