import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import noteService from '../services/noteService';

const UploadNotePage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [noteFile, setNoteFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !noteFile) {
            setError('Title and a note file are required.');
            return;
        }

        setLoading(true);
        setError('');

        // We use FormData to send files and text together
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('noteFile', noteFile);
        if (previewImage) {
            formData.append('previewImage', previewImage);
        }

        try {
            await noteService.uploadNote(formData);
            alert('Note uploaded successfully!');
            navigate('/notes'); // Navigate to the notes gallery after successful upload
        } catch (err) {
            setError('Upload failed. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
            <h2>Upload Your Notes</h2>
            <p>Share your knowledge with the community. All uploads will be reviewed by an admin.</p>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="title">Title*</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ width: '100%', padding: '8px', minHeight: '100px', marginTop: '5px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="price">Price (enter 0 for free)</label>
                    <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min="0"
                        step="0.01"
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="noteFile">Note File (PDF, JPG, PNG)*</label>
                    <input
                        type="file"
                        id="noteFile"
                        onChange={(e) => setNoteFile(e.target.files[0])}
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                        style={{ width: '100%', marginTop: '5px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="previewImage">Preview Image (Optional)</label>
                    <input
                        type="file"
                        id="previewImage"
                        onChange={(e) => setPreviewImage(e.target.files[0])}
                        accept="image/*"
                        style={{ width: '100%', marginTop: '5px' }}
                    />
                </div>
                
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
                    {loading ? 'Uploading...' : 'Upload Note'}
                </button>
            </form>
        </div>
    );
};

export default UploadNotePage;