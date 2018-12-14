const chalk = require('chalk');

const helpMessageRun = () => chalk`
    {bold NAME :}
        zeta run - Launch your worker (back end code) locally

    {bold SYNOPSIS :}
        zeta run [options]

    {bold DESCRIPTION :}
        If you want to test your business logic inside your custom cloud services, you can run them locally without deploy your application.
        Running the "zeta run" command launch your worker. It can interacts with the ZetaPush platform.  

    {bold OPTIONS :}
        {italic --developer-login }

            {reset Override the value in the ".zetarc" file.
            This login is the email used by the developer to the connection on the ZetaPush console. 
            It doesn’t concerns any application developed by the developer. 
            It’s only used to identify the developer account. }

        {italic --developer-password }

            {reset Override the value in the ".zetarc" file.
            Like the property --developer-login, this password is only used for the ZetaPush developer account.
            It doesn’t concerns any application developed by the developer.}

        {italic --app-name } 

            {reset Override the value in the ".zetarc" file.
            A developer can develops many applications. 
            So for his account on the ZetaPush platform, he need to identify each of them. 
            The appName property is the unique name of an application on a ZetaPush developer account.}

        {italic --platform-url }

            {reset Override the value in the ".zetarc" file.
            By default, the developer use the production environment of ZetaPush to develop and deploy its applications.
            In most cases, the developer doesn’t need to set this property. 
            He just need to use this property if ZetaPush says explicitly to use an other ZetaPush platform.}

        {italic --env-name }

            {reset Override the value in the ".zetarc" file.
            An application created by a developer can takes many environments. 
            The default environment is prod but you can create your own (dev, preprod, …​). 
            An environment is one stage in the life-cycle of the application.}
    `;

const helpMessagePush = () => chalk`
    {bold NAME :}
        zeta push - Deploy your application

    {bold SYNOPSIS :}
        zeta push [options]

    {bold DESCRIPTION :}
        Once your application is ready, you can deploy it on the ZetaPush platform.
        If you have a front end part in your application, an URL will be return to access to your application.
        The scalability of the application will be automatic.

    {bold OPTIONS :}
        {italic --developer-login }

            {reset Override the value in the ".zetarc" file.
            This login is the email used by the developer to the connection on the ZetaPush console. 
            It doesn’t concerns any application developed by the developer. 
            It’s only used to identify the developer account. }

        {italic --developer-password }

            {reset Override the value in the ".zetarc" file.
            Like the property --developer-login, this password is only used for the ZetaPush developer account.
            It doesn’t concerns any application developed by the developer.}

        {italic --app-name }

            {reset Override the value in the ".zetarc" file.
            A developer can develops many applications. 
            So for his account on the ZetaPush platform, he need to identify each of them. 
            The appName property is the unique name of an application on a ZetaPush developer account.}

        {italic --platform-url }

            {reset Override the value in the ".zetarc" file.
            By default, the developer use the production environment of ZetaPush to develop and deploy its applications.
            In most cases, the developer doesn’t need to set this property. 
            He just need to use this property if ZetaPush says explicitly to use an other ZetaPush platform.}

        {italic --env-name }
        
            {reset Override the value in the ".zetarc" file.
            An application created by a developer can takes many environments. 
            The default environment is prod but you can create your own (dev, preprod, …​). 
            An environment is one stage in the life-cycle of the application.}
    `;

const helpMessageConfig = () => chalk`
    {bold NAME :}
        zeta config - Set or get the configuration of your application

    {bold SYNOPSIS :}
        zeta config [options]

    {bold DESCRIPTION :}
        Once your application is ready, you can configure it, or check the current configuration.

    {bold OPTIONS :}
        {italic --developer-login }

            {reset Override the value in the ".zetarc" file.
            This login is the email used by the developer to the connection on the ZetaPush console. 
            It doesn’t concerns any application developed by the developer. 
            It’s only used to identify the developer account. }

        {italic --developer-password }

            {reset Override the value in the ".zetarc" file.
            Like the property --developer-login, this password is only used for the ZetaPush developer account.
            It doesn’t concerns any application developed by the developer.}

        {italic --app-name }

            {reset Override the value in the ".zetarc" file.
            A developer can develops many applications. 
            So for his account on the ZetaPush platform, he need to identify each of them. 
            The appName property is the unique name of an application on a ZetaPush developer account.}

        {italic --platform-url }

            {reset Override the value in the ".zetarc" file.
            By default, the developer use the production environment of ZetaPush to develop and deploy its applications.
            In most cases, the developer doesn’t need to set this property. 
            He just need to use this property if ZetaPush says explicitly to use an other ZetaPush platform.}

        {italic --env-name }
        
            {reset Override the value in the ".zetarc" file.
            An application created by a developer can takes many environments. 
            The default environment is prod but you can create your own (dev, preprod, …​). 
            An environment is one stage in the life-cycle of the application.}
            
        {italic --get }

            {reset Get the current configuration of your application.
            At the present time, you can check the verbosity of your logs.}

        {italic --logs }

            {reset Configure the level of your logs.
            At the present time, there are two available levels : 'default' that is useful for an application that is running in production
            and the 'verbose' level that display more logs and store them. It should be useful in development phase.
            ex: 'zeta config --logs default' or 'zeta config --logs verbose'.}
    `;

module.exports = { helpMessageRun, helpMessagePush, helpMessageConfig };
