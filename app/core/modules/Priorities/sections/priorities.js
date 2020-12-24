import cloneDeep from 'lodash/cloneDeep';
import Store from '@/store';
import PriorityService from '../services/priority.service';
import Priorities from '../views/Priorities';

export default (context, router) => {
    const prioritiesContext = cloneDeep(context);
    prioritiesContext.routerPrefix = 'company/priorities';

    const crud = prioritiesContext.createCrud('priorities.crud-title', 'priorities', PriorityService);
    const crudEditRoute = crud.edit.getEditRouteName();
    const crudNewRoute = crud.new.getNewRouteName();

    const navigation = { edit: crudEditRoute, new: crudNewRoute };

    crud.new.addToMetaProperties('permissions', 'priorities/create', crud.new.getRouterConfig());
    crud.new.addToMetaProperties('navigation', navigation, crud.new.getRouterConfig());
    crud.new.addToMetaProperties('afterSubmitCallback', () => router.go(-1), crud.new.getRouterConfig());

    crud.edit.addToMetaProperties('permissions', 'priorities/edit', crud.edit.getRouterConfig());

    const grid = prioritiesContext.createGrid('priorities.grid-title', 'priorities', PriorityService);
    grid.addToMetaProperties('navigation', navigation, grid.getRouterConfig());
    grid.addToMetaProperties('permissions', () => Store.getters['user/user'].is_admin === 1, grid.getRouterConfig());

    const fieldsToFill = [
        {
            key: 'id',
            displayable: false,
        },
        {
            label: 'field.name',
            key: 'name',
            type: 'input',
            required: true,
            placeholder: 'field.name',
        },
        {
            label: 'field.color',
            key: 'color',
            type: 'input',
            required: false,
            placeholder: 'field.color',
        },
    ];

    crud.edit.addField(fieldsToFill);
    crud.new.addField(fieldsToFill);

    grid.addColumn([
        {
            title: 'field.name',
            key: 'name',
        },
        {
            title: 'field.color',
            key: 'color',
        },
    ]);

    grid.addAction([
        {
            title: 'control.edit',
            icon: 'icon-edit',
            onClick: (router, { item }, context) => {
                context.onEdit(item);
            },
            renderCondition: ({ $can }, item) => {
                return $can('update', 'priority', item);
            },
        },
        {
            title: 'control.delete',
            actionType: 'error',
            icon: 'icon-trash-2',
            onClick: async (router, { item }, context) => {
                context.onDelete(item);
            },
            renderCondition: ({ $can }, item) => {
                return $can('delete', 'priority', item);
            },
        },
    ]);

    grid.addPageControls([
        {
            label: 'control.create',
            type: 'primary',
            icon: 'icon-edit',
            onClick: ({ $router }) => {
                $router.push({ name: crudNewRoute });
            },
        },
    ]);

    return {
        accessCheck: async () => Store.getters['user/user'].is_admin === 1,
        scope: 'company',
        order: 20,
        component: Priorities,
        route: {
            name: 'Priorities.crud.priorities',
            path: '/company/priorities',
            meta: {
                label: 'navigation.priorities',
                service: new PriorityService(),
            },
            children: [
                {
                    ...grid.getRouterConfig(),
                    path: '',
                },
                ...crud.getRouterConfig(),
            ],
        },
    };
};
