
import CrudOperations from '@/lib/crud-operations';
import { generateAdminUserToken } from '@/lib/auth';

export async function userRegisterCallback(user: {
  id: string;
  email: string;
  role: string;
}): Promise<void> {
  try {
    const adminToken = await generateAdminUserToken();
    const profilesCrud = new CrudOperations("user_profiles", adminToken);

    const basicProfile = {
      user_id: user.id,
      full_name: user.email.split('@')[0],
      language_preference: 'tr',
    };

    await profilesCrud.create(basicProfile);
    console.log(`Created user profile for user ${user.id}`);
  } catch (error) {
    console.error('Failed to create user profile:', error);
  }
}
