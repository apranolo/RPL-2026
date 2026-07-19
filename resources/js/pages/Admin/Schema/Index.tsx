interface Schema {
    id: number;
    name: string;
    description?: string;
}

interface IndexProps {
    schemas: {
        data: Schema[];
    };
    filters: {
        search?: string;
    };
}

export default function Index({ schemas, filters }: IndexProps) {
    return (
        <div>
            <h1>Daftar Skema Penelitian</h1>
            <ul>
                {schemas.data.map((schema) => (
                    <li key={schema.id}>{schema.name}</li>
                ))}
            </ul>
        </div>
    );
}
