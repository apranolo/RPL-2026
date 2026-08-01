import AnnouncementForm from '../Announcement/Form';
export default function Create(props: any) {
    return <AnnouncementForm {...props} isEditing={false} />;
}
