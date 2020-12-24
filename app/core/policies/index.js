import Store from '@/store';
import TaskPolicy from './task.policy';
import ProjectPolicy from './project.policy';
import UserPolicy from './user.policy';
import InvitationPolicy from './invitation.policy';
import PriorityPolicy from './priority.policy';

Store.dispatch('policies/registerPolicies', {
    task: TaskPolicy,
    project: ProjectPolicy,
    user: UserPolicy,
    invitation: InvitationPolicy,
    priority: PriorityPolicy,
});
